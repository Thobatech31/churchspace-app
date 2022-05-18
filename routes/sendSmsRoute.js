const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  sendCustomSms, sendSmsAllMembers, getWalletBalance
} = require('../controllers/sendSmsController');
const upload = require("../middleware/upload");

router.post("/", verifyTokenUser, sendSmsAllMembers);
router.post("/custom", verifyTokenUser, sendCustomSms);
router.get("/walletbalance", verifyTokenUser, getWalletBalance);

module.exports = router
