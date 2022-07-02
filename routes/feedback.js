const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  sendFeedbackMsg
} = require('../controllers/feedback');
const upload = require("../middleware/upload");

router.post("/", verifyTokenUser, sendFeedbackMsg);


module.exports = router
