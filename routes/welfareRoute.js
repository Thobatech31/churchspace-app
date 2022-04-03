const router = require('express').Router();
const Welfare = require("../models/welfareModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");
const Member = require("../models/memberModel");

const dotenv = require("dotenv");

dotenv.config();


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


//Create  Welfare
router.post("/", verifyTokenUser, async (req, res) => {
  const { email, mobile, first_name, last_name, memberId, request_details
  } = req.body;
  if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
  if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
  if (!first_name) return res.status(401).json({ msg: "First Name Field is Empty" })
  if (!last_name) return res.status(401).json({ msg: "Last Name Field is Empty" })
  if (!request_details) return res.status(401).json({ msg: "Request Details Field is Empty" })

  const user = req.user;

  try {

    const MobileMemberExist = await Member.findOne({mobile: req.body.mobile})

    if(MobileMemberExist){
      const savedWelfare = await Welfare.create({
        userId: user.id,
        email: MobileMemberExist.email,
        mobile: MobileMemberExist.mobile,
        first_name: MobileMemberExist.first_name,
        last_name: MobileMemberExist.last_name,
        request_details,
        memberId: MobileMemberExist.id
      })
      return res.status(200).json({
        status: {
          code: 100,
          msg: "Welfare Added Successfully"
        },
        data: savedWelfare,
      })
    }else{
       const savedWelfareMem = await Welfare.create({
      userId: user.id,
      email,
      mobile,
      first_name,
      last_name,
      request_details,
      memberId: null
    })
      return res.status(200).json({
        status: {
          code: 100,
          msg: "Welfare Added Successfully"
        },
        data: savedWelfareMem,
      })
    }
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})


//UPDATE Welfare (ONLY User CAN UPDATE Welfare)
router.post("/uploadrequestdoc/:id", verifyTokenUser, async (req, res) => {

  const { id } = req.params;

 
  const uploadSingle = upload(process.env.BUCKETNAME).single("request-image");

  uploadSingle(req, res, async(err) =>{
  if(err)
  return res.status(401).json({
    success:false,
    message: err.message
  });


  console.log(req.file);


    const availId = await Welfare.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Welfare with Id does not Exists" });

    const updatedWelfareDoc = await Welfare.findByIdAndUpdate(id, {
      welfareImage: req.file.location,
    }, { new: true });

  return res.status(200).json({
    status: {
      code: 100,
      msg: 'File upload successfully'
    },
    data: updatedWelfareDoc,
  });
});

})

//UPDATE Welfare (ONLY User CAN UPDATE Welfare)
router.put("/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;

  const availId = await Welfare.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Welfare with Id does not Exists" });

  try {
    const updatedWelfare = await Welfare.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Welfare Updated successfully'
      },
      data: updatedWelfare,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})

//Delete Welfare (ONLY User CAN DELETE Welfare)
router.delete("/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;
  const availId = await Welfare.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Welfare with Id does not Exists" });
  try {
    await Welfare.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Welfare deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get Welfare
router.get("/find/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;

  const availId = await Welfare.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Welfare with Id does not Exists" });
  try {
    const Welfares = await Welfare.findById(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Welfare Fetched Successfully",
      },
      data: Welfares
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

// Get All Welfare
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
  //Initiating a seach parameter with (Welfare)
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  const user = req.user;

  try {
    const Welfares = await Welfare.find(query) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalWelfares = Welfares.length;

    if (!Welfares) return res.status(404).json({ msg: "There's No Welfare Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Welfares fetched successfully'
      },
      data: Welfares,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalWelfares),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})

//Get BY USER iD Welfare
router.get("/findByUserId", verifyTokenUser, async (req, res, next) => {
  //Initiating a seach parameter with (Welfare)
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  const user = req.user;

  try {
    const Welfares = await Welfare.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalWelfares = Welfares.length;

    if (!Welfares) return res.status(404).json({ msg: "There's No Welfare Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Welfares fetched successfully'
      },
      data: Welfares,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalWelfares),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})



module.exports = router
