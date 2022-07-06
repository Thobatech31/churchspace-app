const router = require('express').Router();
const User = require('../models/userModel');
const Admin = require('../models/superUserModel');
const CryptoJS = require("crypto-js");
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const request = require('request');
const _ = require("lodash");
const mailgun = require("mailgun-js");
const nodemailer = require("nodemailer");
const { result } = require('lodash');
const dotenv = require("dotenv");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const Transaction = require("../models/transactionModel");
const { initializePayment, verifyPayment } = require('../config/paystack')(request);
const {loginSchema, registerSchema, registerSuperSchema, changePasswordSchema} = require('../middleware/authentication/users_validation_schema');



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
const registerAdmin = async (req, res) => {
    const { username, email, mobile, first_name, last_name } = req.body;

    //Check if username already exists in the DB
    const usernameExists = await Admin.checkUsernameAlreadyExist(username)
    if (usernameExists) return res.status(400).json({ msg: "Username Already Exists" });
    //Check if email already exists in the DB
    const emailExists = await Admin.checkEmailAlreadyExist(email)
    if (emailExists) return res.status(400).json({ msg: "Email Already Exists" });
    //Check if Mobile already exists in the DB
    const mobileExists = await Admin.checkMobileAlreadyExist(mobile)
    if (mobileExists) return res.status(400).json({ msg: "Mobile Already Exists" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    try {
        await registerSuperSchema.validateAsync(req.body);
        const savedUser = await Admin.create({
            username,
            email,
            mobile,
            first_name,
            last_name,
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
        if(err.isJoi === true){
            return res.status(400).json({msg: err.details[0].message})
        }
        return res.status(500).json({msg: err.message})
    }
}



//LOGIN ADMIN
const loginAdmin = async (req, res) => {
    const { username } = req.body;

    try {
        //await schema.validateAsync({ username: req.body.username, password: req.body.password });
        await loginSchema.validateAsync(req.body);

        //check if the Admin with the username exist
        const adminUser = await Admin.findOne({ username: username })
        if (!adminUser) return res.status(400).json({ msg: "Wrong Username or Password" })

        const validated = await bcrypt.compare(req.body.password, adminUser.password);
        !validated && res.status(400).json({ msg: "Password is Wrong" });

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
        if(err.isJoi === true){
            return res.status(400).json({msg: err.details[0].message})
        }
        return res.status(500).json({msg: err})
    }
}

//REGISTER WITH EMAIL VERIFICATION
const registerUser = async (req, res) => {
    const { username, email, mobile, first_name, last_name, church_name, church_denomination, church_address, church_website, church_id } = req.body;
    //Generate Random character for the church code
    const church_code = nanoid(10);
    //Check if username already exists in the DB
    const usernameExists = await User.checkUsernameAlreadyExist(username)
    if (usernameExists) return res.status(400).json({ msg: "Username Already Exists" });

    //Check if email already exists in the DB
    const emailExists = await User.checkEmailAlreadyExist(email)
    if (emailExists) return res.status(400).json({ msg: "Email Already Exists" });

    //Check if Mobile already exists in the DB
    const mobileExists = await User.checkMobileAlreadyExist(mobile)
    if (mobileExists) return res.status(400).json({ msg: "Mobile Already Exists" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //get the logged in user details from the token
    const user = req.user;

    try {
        await registerSchema.validateAsync(req.body);
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
            church_id: church_code.toUpperCase(),
            super: user.id,
            password: hashPassword
        });

        const mailOptions = {
            from: 'sender@gmail.com', // Sender address
            to: "owolabitoba31@gmail.com", // List of recipients
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
                msg: 'Registration Successfully'
            },
            data: savedUser,
        })
    } catch (err) {
        if(err.isJoi === true){
            return res.status(400).json({msg: err.details[0].message})
        }
        return res.status(500).send(err.message)
    }
}

//LOGIN USER
const loginUser = async (req, res) => {
    const { username } = req.body;
    try {
        await loginSchema.validateAsync(req.body);
        //check if the user with the username exist
        const user = await User.findOne({ username: username })
        if (!user) return res.status(400).json({ msg: "Wrong Username or Password" })
        const validated = await bcrypt.compare(req.body.password, user.password);
        !validated && res.status(400).json({ msg: "Password is Wrong" });
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
        if(err.isJoi === true){
            return res.status(400).json({msg: err.details[0].message})
        }
        return res.status(500).json({msg: err})
    }
}

//FORGOT PASSWORD
const forgotPassword =async (req, res) => {
    const { email } = req.body;

    //Check if email already exists in the DB
    const user = await User.checkEmailAlreadyExist(email)
    if (!user)
        return res.status(400).json({ msg: "User with this Email does not Exists" });
    try {
        const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });
        const data = {
            from: 'churchspace@elta.solutions',
            to: email,
            subject: 'Church Space Password Reset Link',

            html: `
            <!DOCTYPE html>
                <html>

                <head>
                <meta name="viewport" content="width=device-width" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link
                    href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap"
                    rel="stylesheet" />

                <style>
                    * {
                    padding: 0;
                    margin: 0;
                    text-decoration: none;
                    list-style: none;
                    box-sizing: border-box;
                    font-family: "Nunito";
                    font-style: normal;
                    font-weight: 600;
                    }

                    img {
                    border: none;
                    -ms-interpolation-mode: bicubic;
                    max-width: 100%;
                    }

                    body {
                    background-color: #e5e5e5;
                    font-family: "Nunito";
                    font-weight: 600;
                    font-style: normal;
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 0;
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                    }

                    table {
                    border-collapse: separate;
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    width: 100%;
                    }

                    table td {
                    font-size: 14px;
                    vertical-align: top;
                    font-family: "Nunito";
                    font-weight: 600;
                    font-style: normal;
                    }

                    .body {
                    background-color: #e5e5e5;
                    width: 100%;
                    font-family: "Nunito";
                    font-weight: 600;
                    font-style: normal;
                    }

                    /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                    .container {
                    display: block;
                    margin: 0 auto !important;
                    /* makes it centered */
                    max-width: 600px;
                    padding: 10px;
                    width: 600px;
                    }

                    /* This should also be a block element, so that it will fill 100% of the .container */
                    .content {
                    box-sizing: border-box;
                    display: block;
                    margin: 0 auto;
                    max-width: 600px;
                    padding: 10px;
                    }


                    .main {
                    background: #ffffff;
                    border-radius: 5px;
                    width: 100%;
                    border: 0.1px solid #e5e5e5;
                    }

                    .wrapper {
                    box-sizing: border-box;
                    padding: 20px 30px 5px 30px;
                    }

                    .img-icon {
                    width: 120px;
                    object-fit: cover;
                    }

                    h1,
                    h2,
                    h3,
                    h4 {
                    color: #000000;
                    font-family: "Nunito";
                    font-style: normal;
                    font-weight: 600;
                    line-height: 1.4;
                    margin: 0;
                    margin-bottom: 10px;
                    }

                    p,
                    ul,
                    ol {
                    font-family: "Nunito";
                    font-style: normal;
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 20px;
                    margin: 0;
                    margin-bottom: 15px;
                    color: #4A5768;
                    }

                    p li,
                    ul li,
                    ol li {
                    list-style-position: inside;
                    margin-left: 5px;
                    }

                    a {
                    color: #22205F;
                    text-decoration: underline;
                    }

                    .text-header-color {
                    color: #22205F;
                    ;
                    }


                    .text-color {
                    color: #22205F;
                    }

                    /* -------------------------------------
                            BUTTONS
                        ------------------------------------- */
                    .btn {
                    box-sizing: border-box;
                    width: 100%;
                    }

                    .btn>tbody>tr>td {
                    padding-bottom: 15px;
                    }

                    .btn table {
                    width: auto;
                    }

                    .btn table td {
                    background-color: #ffffff;
                    border-radius: 5px;
                    text-align: center;
                    }

                    .btn a {
                    background-color: #22205F;
                    border: solid 1px #22205F;
                    border-radius: 5px;
                    box-sizing: border-box;
                    color: #FFFFFF;
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                    margin: 0;
                    padding: 10px 15px;
                    text-decoration: none;
                    }

                    .btn-primary table td {
                    background-color: #F2F7F9;
                    }

                    .btn-primary a {
                    background-color: #22205F;
                    border-color: #22205F;
                    color: #FFFFFF;
                    }

                    .font-weight-400 {
                    font-weight: 400;
                    }

                    .font-weight-700 {
                    font-weight: 700;
                    }

                    .py-5 {
                    padding: 5px 0;
                    }

                    .py-10 {
                    padding: 10px 0;
                    }

                    .py-15 {
                    padding: 20px 0;
                    }

                    .mt-5,
                    .my-5 {
                    margin-top: 5px;
                    }

                    .mt-10,
                    .my-10 {
                    margin-top: 10px;
                    }

                    .mt-15,
                    .my-15 {
                    margin-top: 15px;
                    }

                    .mt-20,
                    .my-20 {
                    margin-top: 20px;
                    }

                    .mt-30,
                    .my-30 {
                    margin-top: 30px;
                    }

                    .mt-40,
                    .my-40 {
                    margin-top: 40px;
                    }

                    .mb-30,
                    .my-30 {
                    margin-bottom: 30px;
                    }

                    h1,
                    .h1 {
                    font-size: 40px;
                    line-height: 1.6;
                    font-family: "Nunito";
                    }

                    h2,
                    .h2 {
                    font-size: 30px;
                    line-height: 1.6;
                    font-family: "Nunito";
                    }

                    h3,
                    .h3 {
                    font-size: 20px;
                    line-height: 1.6;
                    font-family: "Nunito";
                    }

                    h4,
                    .h4 {
                    font-size: 18px;
                    line-height: 1.6;
                    font-family: "Nunito";
                    }

                    .align-center {
                    text-align: center !important;
                    }

                    .powered-by a {
                    text-decoration: none;
                    }

                    .pl-20 {
                    padding-left: 20px;
                    }

                    .social-logos img {
                    padding: 0 2px;
                    }

                    .flex-display {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    }

                    hr {
                    border: 0;
                    border-bottom: 1px solid #f6f6f6;
                    margin: 20px 0;
                    }

                    /* -------------------------------------
                            RESPONSIVE AND MOBILE FRIENDLY STYLES
                        ------------------------------------- */
                    @media only screen and (max-width: 620px) {
                    table[class="body"] h1 {
                        font-size: 28px !important;
                        margin-bottom: 10px !important;
                    }

                    table[class="body"] p,
                    table[class="body"] ul,
                    table[class="body"] ol,
                    table[class="body"] td,
                    table[class="body"] span,
                    table[class="body"] a {
                        font-size: 16px !important;
                    }

                    table[class="body"] .wrapper,
                    table[class="body"] .article {
                        padding: 10px !important;
                    }

                    table[class="body"] .content {
                        padding: 0 !important;
                    }

                    table[class="body"] .container {
                        padding: 0 !important;
                        width: 100% !important;
                    }

                    table[class="body"] .main {
                        border-left-width: 0 !important;
                        border-radius: 0 !important;
                        border-right-width: 0 !important;
                    }

                    table[class="body"] .btn table {
                        width: 100% !important;
                    }

                    table[class="body"] .btn a {
                        width: 100% !important;
                    }

                    table[class="body"] .img-responsive {
                        height: auto !important;
                        max-width: 100% !important;
                        width: auto !important;
                    }
                    }

                    /* -------------------------------------
                            PRESERVE THESE STYLES IN THE HEAD
                        ------------------------------------- */
                    @media all {
                    .ExternalClass {
                        width: 100%;
                    }

                    .ExternalClass,
                    .ExternalClass p,
                    .ExternalClass span,
                    .ExternalClass font,
                    .ExternalClass td,
                    .ExternalClass section {
                        line-height: 100%;
                    }

                    .apple-link a {
                        color: inherit !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                        text-decoration: none !important;
                    }

                    #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                        font-size: inherit;
                        font-family: inherit;
                        font-weight: inherit;
                        line-height: inherit;
                    }

                    .btn-primary table td:hover {
                        background-color: #22205F !important;
                    }

                    .btn-primary a:hover {

                        background-color: #22205F !important;
                        border-color: #22205F !important;
                    }
                    }

                    @media (min-width: 992px) {
                    h1 {
                        font-size: 30px;
                    }

                    h2 {
                        font-size: 24px;
                    }

                    h3 {
                        font-size: 18px;
                    }

                    h4 {
                        font-size: 16px;
                    }

                    h5 {
                        font-size: 14px;
                    }

                    h6 {
                        font-size: 12px;
                    }
                    }
                </style>
                </head>

                <body class="">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                    <tr>
                    <td>&nbsp;</td>
                    <td class="container">
                        <section class="content">


                        <!-- START CENTERED WHITE CONTAINER -->
                        <table role="presentation" class="main">
                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                            <td class="wrapper">
                                <table class="align-center mt-5">
                                <tr>
                                    <td>

                                    <img border="0" vspace="0" hspace="0"
                                        src="data:image/png;base64,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"
                                        alt="Logo" title="Logo" />
                                    </td>
                                </tr>
                                </table>

                                <table class="">
                                <tr>
                                    <td>
                                    <h1 class="font-weight-700 text-header-color mt-5 align-center">
                                        Reset Password !
                                    </h1>

                                    <p class="text-color font-weight-400 mt-5">
                                       Hi <b style="text-transform: uppercase; color: black; font-size: 18px; font-weight: 700;">${user.username}</b>, You told us you forgot your password . If you really did,click here to choose a new one ;
                                    </p>

                                    </td>
                                </tr>
                                </table>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>


                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                        class="btn btn-primary mt-20">
                                        <tbody>
                                        <tr>
                                            <td align="center">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                <tbody>
                                                <tr>
                                                    <td>
                                                    <a href="${process.env.CLIENT_URL}/resetpassword/${token}" target="_blank">Reset Password</a>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>



                                    <p class="text-color font-weight-400 mt-20 mb-30">
                                        If you didn’t mean to rest your password you can Ignore this email and your password will remain
                                        unchanged.
                                    </p>
                                    <br /><br />





                                    <h5 class="flex-display align-center">
                                        <img border="0" vspace="0" hspace="0" style="height: 15px;"
                                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFGSURBVHgBZVHBUcMwENy75B+nAz35ZaggoQJCAQzpIHnyC3SAO3CGBqACQgU4Pz4ZRAeiAEnsWfZMIOeHrNPu3t6doA/nVpUirTNkIcDCchlomauP/rkZcKMT8AMg9wS7jPwusA8XzC2n1Ww6qS4/Q2iDGkGRPxK0HVQI/cKfyJ6YNxMeO3e7siKKWJH6wseDkXk/kMqc3A2u6WIzVogrfsV8T6i+pRo9q91pD3uFznNXWb1ZogoCgXNBesW/sFwuQ/ARkfa7klIbMWEUcBZmCxUFH1lpqzY6INkLyyVnZ4J8M++tcs/yGWnCXFDhCKmytipsllS5GSF65vf8v6LyjB3u+L5hv7US9FSUEncRQ2lU5wSs6HcRIbtuJoyjbxr1vgmmRKK3HkiirfxTnETbrI1bDFOGcBK2GB7LfpnXqQzDUbQZML/vTnr1epwZ5AAAAABJRU5ErkJggg=="
                                        alt="Logo" title="Logo" />
                                        <img border="0" vspace="0" hspace="0" style="padding-left: 8px; height: 15px;"
                                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEeSURBVHgBnVHLUcNADNXK3Nl0IHzihukg6YACCN50QAceKiBHblmTAqAD3AHmxiWeTQcuALw82Y75zHAAzdherZ709J6J/hjmayJyOTeUFLjMkNpIVDF15S5s/QHDh0MqVwVTsolkbjoyJ00oDc5lJC609o1BZOkYBQAXSFumd6f3HSWPw9T4hNoqBF/x0MW5weSx+Iz3GaZnKF4AFBRsKPYsRyPNfBf8IpXlNcAV1ln90FqPuiYNrYiz9EuApVUTJga4UeOTYWevK6WSb3QIVOybsF2rRnVsYlBnAFSQHYSbFzx7FQ1mUUMYjik26fdp6zCz5zMIu+V+6v3dsc1eid5OAXxAc9kEv55s/fxxzqEpVxN0jq6q7Gon/Tc+AOdPa+SXRY2eAAAAAElFTkSuQmCC"
                                        alt="Logo" title="Logo" />
                                        <span>-2022</span>
                                    </h5>

                                    </td>

                                </tr>
                                </table>


                            </td>
                            </tr>

                            <!-- END MAIN CONTENT AREA -->

                        </table>



                        </section>

                    </td>
                    <td>&nbsp;</td>
                    </tr>
                </table>
                </body>

                </html>
            `
        };
        return user.updateOne({ resetLink: token }, {
            $set: {
                new: true
            }
        }, function (err, success) {
            if (err) {
                return res.status(400).json({ msg: "Reset password link error" });
            } else {
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return res.status(400).json({
                            msg: error.message
                        })
                    }
                    return res.status(200).json({
                        status: {
                            code: 100,
                            msg: 'Email has been sent successfully, Kindly Follow the instruction'
                        },
                        data: {
                            email: user.email,
                            username: user.username
                        }

                    })
                });
            }
        })
    } catch (err) {
        return res.status(500).json(err.message)
    }
}

//RESET PASSWORD
const resetPassword = async (req, res) => {
    const { resetLink, newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (err, decodedData) {
            if (err) {
                res.status(400).json({ msg: "Incorrect Token or Expired Toekn" })
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
}

//CHANGE PASSWORD
const changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    const username = req.user.username;
    const user = await User.findOne({ username: username })

    const originalPassword = await bcrypt.compare(oldPassword, user.password);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    try {
        await changePasswordSchema.validateAsync(req.body);
        if (originalPassword) {
            if (newPassword == confirmPassword) {
                const UpdatePass = await User.findByIdAndUpdate(user._id, {
                    password: hashPassword
                }, { new: true });
                const { password, ...others } = UpdatePass._doc
                return res.status(200).json({
                    status: {
                        code: 100,
                        msg: "Password Updated Succesfully"
                    },
                    data: { ...others }
                })
            } else {
                return res.status(400).json({
                    msg: "New Password and Confirm Password Does Not Match"
                });
            }
        } else {
            return res.status(400).json({
                msg: "Old Password Not Correct",
            })
        }
    } catch (err) {
        if(err.isJoi === true){
            return res.status(400).json({msg: err.details[0].message})
        }
        return res.status(500).json({
            msg: err
        });
    }
}

//UPDATE Church  Logo(ONLY Admin CAN UPDATE Logo)
const uploadChurchLogo = async (req, res) => {
    const { id } = req.params;
    const uploadSingle = upload(process.env.BUCKETNAME).single("church-logo");

    uploadSingle(req, res, async (err) => {
        if (err)
            return res.status(400).json({
                success: false,
                message: err.message
            });
        console.log(req.file);
        const availId = await User.findOne({ _id: id })
        if (!availId) return res.status(400).json({ msg: "User(Church) with Id does not Exists" });

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
}


module.exports = {
    registerAdmin, loginAdmin,
    registerUser, loginUser,
    changePassword, resetPassword,
    forgotPassword, uploadChurchLogo
}
