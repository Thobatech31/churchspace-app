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
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");
const Transaction = require("../models/transactionModel");
const { initializePayment, verifyPayment } = require('../config/paystack')(request);


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

//UPDATE User (ONLY Admin CAN UPDATE Member)
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
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


//Fund Wallet
router.post('/paystack/pay', verifyTokenUser, (req, res) => {
  const user = req.user;

  const form = _.pick(req.body, ['amount', 'email', 'full_name']);
  form.metadata = {
    full_name: form.full_name
  }
  // form.amount *= 100;

  initializePayment(form, async (error, body) => {
    if (error) {
      //handle errors
      // console.log(error);
      res.status(401).json({ msg: error })
      return;
    }

    response = JSON.parse(body);
    console.log(response)
    // console.log(response.data.authorization_url)

    // const reference_id = nanoid(10);

    const savedTrans = await Transaction.create({
      userId: user.id,
      // ref: reference_id.toUpperCase(),
      ref: response.data.reference,
      amount: req.body.amount,
    })
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Transaction Initiated Successfully"
      },
      data: savedTrans,
    })

  });
});

router.get('/paystack/verify', verifyTokenUser, (req, res) => {
  const { ref } = req.body;
  const user = req.user;

  verifyPayment(ref, async (error, body) => {
    if (error) {
      //handle errors appropriately
      return res.status(401).json({ msg: error })
      // return res.redirect('/error');
    }
    response = JSON.parse(body);

    // console.log("VERIFICATION LOGS", response)

    const data = _.at(response.data, ['reference', 'amount', 'customer.email', 'metadata.full_name']);

    [reference, trans_amount, email, full_name] = data;
    try {

      const updatedTransaction = await Transaction.findByIdAndUpdate(req.body.trans_id, {
        status: 1,
        updatedAt: Date.now()
      }, { new: true });

      const userBalanceDetails = await User.findById(updatedTransaction.userId)
      var user_balance = userBalanceDetails.amount


      const usepdateUser = await User.findByIdAndUpdate(updatedTransaction.userId, {
        amount: trans_amount + user_balance
      }, { new: true });

      return res.status(200).json({
        status: {
          code: 100,
          msg: 'Transaction Successfully'
        },
        // data: userBalanceDetails,
      })

    } catch (err) {
      return res.status(500).json({ msg: err });

    }
  })
});



//Get User
router.get("/:id", verifyTokenAndAdmin, async (req, res) => {
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
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
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
router.get("/all/getusers", verifyTokenAndAdmin, async (req, res) => {
  //Initiating a seach parameter with (User)
  const { super_id } = req.body;
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "first_name": { $regex: req.query.search, $options: 'i' } },
      { "last_name": { $regex: req.query.search, $options: 'i' } },
      { "email": { $regex: req.query.search, $options: 'i' } },
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
