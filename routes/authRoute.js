const router = require('express').Router();
const User = require('../models/userModel');
const Admin = require('../models/superUserModel');
const CryptoJS = require("crypto-js");
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const mailgun = require("mailgun-js");
const nodemailer = require("nodemailer");
const { result } = require('lodash');
const dotenv = require("dotenv");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");

dotenv.config();

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_APP_APIKEY, domain: DOMAIN });

const aws = require('aws-sdk')                // aws-sdk library will used to upload image to s3 bucket.
const multer = require('multer')              // multer will be used to handle the form data.
const multerS3 = require('multer-s3');              // multer will be used to handle the form data.

const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "eu-west-2",
    maxRetries: 3,
    httpOptions: { timeout: 30000, connectTimeout: 5000 },
})

const upload = (bucketName) =>
    multer({
        storage: multerS3({
            s3,
            bucket: bucketName,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname })
            },
            key: function (req, file, cb) {
                cb(null, `image-${Date.now()}.png`);
            },
        }),
    });

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.NODEMAILER_EMAIL_ADDR,
        pass: process.env.NODEMAILER_PASSWORD
    },
});

//CREAT ADMIN USER WITHOUT EMAIL VERIFICATION
router.post("/create-admin", async (req, res) => {
    const { username, email, mobile, first_name, last_name } = req.body;

    //Check If Username Field Empty
    if (!username) return res.status(401).json({ msg: "Username Field is Empty" })

    //Check If Email address Field Empty
    if (!email)  return res.status(401).json({ msg: "Email Field is Empty" })

    //Check If Mobile Field Empty
    if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })

    //Check If First name OR Last name Field Empty
    if (!first_name) return res.status(401).json({ msg: "First name Field is Empty" })

    //Check If First name OR Last name Field Empty
    if (!last_name) return res.status(401).json({ msg: "Last name Field is Empty" })

    //Check If Password Field Empty
    if (!req.body.password) return res.status(401).json({ msg: "Password Field is Empty" })

    //Check if username already exists in the DB
    const usernameExists = await Admin.checkUsernameAlreadyExist(username)
    if (usernameExists) return res.status(401).json({ msg: "Username Already Exists" });

    //Check if email already exists in the DB
    const emailExists = await Admin.checkEmailAlreadyExist(email)
    if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

    //Check if Mobile already exists in the DB
    const mobileExists = await Admin.checkMobileAlreadyExist(mobile)
    if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    try {
        const savedUser = await Admin.create({
            username,
            email,
            mobile, first_name, last_name,
            password: hashPassword
        });
        return res.status(200).json({
            status: {
                code: 100,
                msg: 'registration successfully'
            },
            data: savedUser,
        })
    } catch (err) {
        return res.status(500).send(err.message)
    }
})


//LOGIN ADMIN
router.post("/admin-login", async (req, res) => {
    const { username } = req.body;
    try {
        //check if the Admin with the username exist
        const adminUser = await Admin.findOne({ username: username })
        if (!adminUser)
            return res.status(401).json({ msg: "Wrong Username or Password" })

        const validated = await bcrypt.compare(req.body.password, adminUser.password);
        !validated && res.status(400).json({ msg: "Password is Wrong"});

        const token = jwt.sign({
            id: adminUser._id,
            username: adminUser.username,
            email: adminUser.email,
            isAdmin: adminUser.isAdmin,
        },
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: "3d" },
        );
        const { password, ...others } = adminUser._doc
        res.status(200).json({
            status: {
                code: 100,
                msg: "Login Succesfully"
            },
            data: { ...others, token }
        })
    } catch (err) {
        return res.status(500).send(err)
    }
})


//REGISTER WITHOUT EMAIL VERIFICATION
router.post("/register", verifyTokenAndAdmin, async (req, res) => {
    const { username, email, mobile, first_name, last_name, church_name,
        church_denomination, church_address, church_website, church_id } = req.body;

    //Check If Username Field Empty
    if (!username) return res.status(401).json({ msg: "Username Field is Empty" })

    //Check If Email address Field Empty
    if (!email) return res.status(401).json({ msg: "Email Field is Empty" })

    //Check If Mobile Field Empty
    if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })

    //Check If First name OR Last name Field Empty
    if (!first_name) return res.status(401).json({ msg: "First name Field is Empty" })

    //Check If First name OR Last name Field Empty
    if (!last_name) return res.status(401).json({ msg: "Last name Field is Empty" })

    //Check If church_name Field Empty
    if (!church_name) return res.status(401).json({ msg: "Church Name Field is Empty" })

    //Check If church_address Field Empty
    if (!church_address) return res.status(401).json({ msg: "Church Address Field is Empty" })

    //Check If church_website Field Empty
    if (!church_website) return res.status(401).json({ msg: "Church website Field is Empty" })

    //Check If church_denomination Field Empty
    if (!church_denomination) return res.status(401).json({ msg: "Church denomination Field is Empty" })


    const church_code = nanoid(10);


    //Check If church_id Field Empty
    if (!church_code) return res.status(401).json({ msg: "Church Id Field is Empty" })

    //Check If Password Field Empty
    if (!req.body.password) return res.status(401).json({ msg: "Password Field is Empty" })

    //Check if username already exists in the DB
    const usernameExists = await User.checkUsernameAlreadyExist(username)
    if (usernameExists) return res.status(401).json({ msg: "Username Already Exists" });

    //Check if email already exists in the DB
    const emailExists = await User.checkEmailAlreadyExist(email)
    if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

    //Check if Mobile already exists in the DB
    const mobileExists = await User.checkMobileAlreadyExist(mobile)
    if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //get the logged in user details from the token
    const user = req.user;

    try {
        const savedUser = await User.create({
            username,
            email,
            mobile, 
            first_name, 
            last_name, 
            church_name,
            church_denomination, 
            church_address,
             church_website,
            church_id:church_code.toUpperCase(),
            super:user.id,
            password: hashPassword
        });

        const mailOptions = {
            from: 'sender@gmail.com', // Sender address
            to: email, // List of recipients
            subject: 'Node Mailer', // Subject line
            html: '<h2 style="color:#ff6600;">Hello People!, Welcome to Bacancy!</h2> ',
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err)
            } else {
                console.log(info);
            }
        });

        
        return res.status(200).json({
            status: {
                code: 100,
                msg: 'registration successfully'
            },
            data: savedUser,
        })
    } catch (err) {
        return res.status(500).send(err.message)
    }
})


//LOGIN USER
router.post("/login", async (req, res) => {
    const { username } = req.body;

    //Check If Username Field Empty
    if (!username) return res.status(401).json({ msg: "Username Field is Empty" })

    //Check If Email address Field Empty
    if (!req.body.password) return res.status(401).json({ msg: "password Field is Empty" })

    try {
        //check if the user with the username exist
        const user = await User.findOne({ username: username })
        if (!user) return res.status(401).json({ msg: "Wrong Username or Password" })
        const validated = await bcrypt.compare(req.body.password, user.password);
        !validated && res.status(400).json({msg:"Password is Wrong"});
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        },
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: "3d" },
        );
        const { password, ...others } = user._doc
        res.status(200).json({
            status: {
                code: 100,
                msg: "Login Succesfully"
            },
            data: { ...others, token }
        })
    } catch (err) {
        return res.status(500).send(err)
    }
})


//FORGOT PASSWORD
router.put("/forgot-password", async (req, res) => {
    const { email } = req.body;

    //Check if email already exists in the DB
    const user = await User.checkEmailAlreadyExist(email)
    if (!user)
        return res.status(401).json({ msg: "User with this Email does not Exists" });
    try {
        const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });
        const data = {
            from: 'fakeemail@gmail.com',
            to: email,
            subject: 'Church App Password Reset Link',
            html: `
                <h2>Please click on the given link to reset  your password</h2>
                <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
            `
        };
        return user.updateOne({ resetLink: token }, function (err, success) {
            if (err) {
                return res.status(400).json({ msg: "Reset password link error" });
            } else {
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return res.status(401).json({
                            msg: err.message
                        })
                    }
                    return res.status(200).json({
                        status: {
                            code: 100,
                            msg: 'Email has been sent successfully, Kindly Follow the instruction'
                        },
                        email: user.email,
                        username: user.username
                    })
                });
            }
        })
    } catch (err) {
        return res.status(500).json(err.message)
    }
})

//RESET PASSWORD
router.put("/reset-password", async (req, res) => {
    const { resetLink, newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (err, decodedData) {
            if (err) {
                res.status(401).json({ msg: "Incorrect Token or Expired Toekn" })
            }
            User.findOne({ resetLink }).exec((err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        status: 400,
                        message: "User with with this token does not exist"
                    })
                }
                const obj = {
                    password: hashPassword, // password Encryption 

                }
                user = _.extend(user, obj);
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({ msg: "Reset password error" });
                    } else {
                        return res.status(200).json({ msg: "Your password has been change" })
                    }
                })
            })
        })
    } else {
        return res.status(500).json({ msg: "Authentication Error !!!" })
    }
})

//CHANGE PASSWORD
router.put("/change-password", verifyToken, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    const username = req.user.username;
    const user = await User.findOne({ username:username })


    //Check If Old Password Field Empty
    if (!oldPassword) return res.status(401).json({ msg: "Old Password Field is Empty" })

    //Check If New Password address Field Empty
    if (!newPassword) return res.status(401).json({ msg: "New Password Field is Empty" })

    //Check If confirmPassword Password address Field Empty
    if (!confirmPassword) return res.status(401).json({ msg: "Confirm Password Field is Empty" })

    // const originalPassword = await bcrypt.compare(oldHashPassword, user.password);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    try{
        if (newPassword == confirmPassword) {
            console.log(username)
            const UpdatePass = await User.findByIdAndUpdate(user._id, {
                password: hashPassword
            }, { new: true });
            const { password, ...others } = UpdatePass._doc

            return res.status(200).json({
                status: {
                    code: 100,
                    msg: "Password Updated Succesfully"
                },
                data: { ...others}
            })
        }else{
            return res.status(500).json({ msg: "new Password and Confirm Password does not Match" });

        }

    }catch (err){
        return res.status(500).json({ msg: err });

    }
})

//UPDATE User (ONLY Admin CAN UPDATE Member)
router.put("/users/:id", verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;

    const availId = await User.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "User with Id does not Exists" });

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'User Updated successfully'
            },
            data: updatedUser,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})

//UPDATE Church  Logo(ONLY Admin CAN UPDATE Logo)
router.post("/uploadchurchlogo/:id", verifyTokenAndAdmin, async (req, res) => {

    const { id } = req.params;


    const uploadSingle = upload(process.env.BUCKETNAME).single("church-logo");

    uploadSingle(req, res, async (err) => {
        if (err)
            return res.status(401).json({
                success: false,
                message: err.message
            });

        console.log(req.file);


        const availId = await User.findOne({ _id: id })
        if (!availId) return res.status(401).json({ msg: "User(Church) with Id does not Exists" });

        const updatedChurchLogo = await User.findByIdAndUpdate(id, {
            church_logo: req.file.location,
        }, { new: true });


        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Logo upload successfully'
            },
            data: updatedChurchLogo,
        });
    });

})

//Get User
router.get("/user/:id", verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;

    const availId = await User.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "User with Id does not Exists" });
    try {
        const UserData = await User.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "User Fetched Successfully",
            },
            data: UserData
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
})

//Delete User (ONLY Admin CAN DELETE User)
router.delete("/user/:id", verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;
    const availId = await User.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "User with Id does not Exists" });

    try {
        await User.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "User deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
})

//Get all Users based on SUPERADMIN ID (ONLY admin user CAN GET ALL users)
router.get("/getusers", verifyTokenAndAdmin, async (req, res) => {
    //Initiating a seach parameter with (User)
    const {super_id} = req.body;
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    try {
        const users = await User.find(req.query.search ? query : { super: super_id }) 
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of records for that model
        const totalUsers = await User.countDocuments();

        if (!users) return res.status(404).json({ msg: "There's No User Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Users fetched successfully'
            },
            data: users,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalUsers),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

})

module.exports = router
