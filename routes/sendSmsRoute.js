const router = require('express').Router();
const { split, join } = require('lodash');
const axios = require('axios');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");



//Send Sms
router.post("/custom", async (req, res) => {
  const { sender_id, mobile, message
  } = req.body;
  if (!sender_id) return res.status(401).json({ msg: "Sender ID Field is Empty" });
  if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
  if (!message) return res.status(401).json({ msg: "Message Field is Empty" })

  // const nos_list = str_replace(array("\n", ":", ";"), ",", mobile);
  const nos_list = mobile;
  const nos = split(nos_list);
  const n_list = [...new Set(nos)]

  const d_list = n_list.join(",");


  const url = `${process.env.DOJAH_BASE_URL}/messaging/sms/`;
  const postVars = {
    'destination': d_list,
    'message': message,
    'channel': 'sms',
    'sender_id': sender_id
  };

  const options = {
    'method': 'POST',
    data: JSON.stringify(postVars),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.DOJAH_SECRET_KEY,
      'AppId': process.env.DOJAH_APP_ID,
    }
  };


  try {
    let resp = await axios(url, options);
    let data = resp.data;
    console.log(data);
    // console.log(resp);
    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Message Sent  Successfully'
      },    
      data: data,
    })
  } catch (error) {
    
    console.log(error); // this is the main part. Use the response property from the error object

    return res.status(500).json({ msg: error });
  }
})



//Send Sms
router.get("/walletbalance", async (req, res) => {

  const url = `${process.env.DOJAH_BASE_URL}/balance/`;
  const options = {
    'method': 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.DOJAH_SECRET_KEY,
      'AppId': process.env.DOJAH_APP_ID,
    }
  };

  try {
    let resp = await axios(url, options);
    let data = resp.data;
    console.log(data);
    // console.log(resp);
    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Wallet Balance Fetched Successfully'
      },
      wallet_balance: data,

    })
  } catch (error) {
    console.log(error); // this is the main part. Use the response property from the error object

    return res.status(500).json({ msg: error });
  }
})


module.exports = router

