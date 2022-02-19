const router = require('express').Router();
const User = require('../models/userModel');
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const mailgun = require("mailgun-js");
const { result } = require('lodash');
const DOMAIN = 'sandbox1007fd244adb439091af67d5b46543d1.mailgun.org';
const mg = mailgun({ apiKey: 'efe5ce01dcc618d9e3b297f06f81cc8a-c250c684-64e5fd3a', domain: DOMAIN });
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const Feedback = require('../models/feedbackModel');

//Send Feedback
router.post("/", verifyToken, async (req, res) => {
  const { feedback_message } = req.body;

  //Check If First name OR Last name Field Empty
  if (!feedback_message) return res.status(401).json({ msg: "Feedback Message Field is Empty" })

  //get the logged in user details from the token
  const seesionUser = req.user;

  const email = seesionUser.email;
  //Check if email already exists in the DB
  const user = await User.checkEmailAlreadyExist(email)
  if (!user)
    return res.status(401).json({ msg: "User with this Email Already does not exists Exists" });
  try {
    const data = {
      from: email,
      to: process.env.CHURCH_EMAIL,
      subject: 'Feedback Message',
      html: `
                <h2>Feedback Message Church Space</h2>
                <p>${feedback_message}</p>
            `
    };
        mg.messages().send(data, function (error, body) {
          if (error) {
            return res.status(401).json({
              msg: err.message
            })
          }
          const feedbackMessage = Feedback.create({
            email,
            feedback_message
          });
          return res.status(200).json({
            status: {
              code: 100,
              msg: 'Feedback Message has been sent successfully'
            },
            data: feedbackMessage,
          })
        });
  } catch (err) {
    return res.status(500).json(err.message)
  }
})


module.exports = router
