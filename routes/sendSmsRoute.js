const router = require('express').Router();
const { split, join } = require('lodash');
const axios = require('axios');
const Member = require("../models/memberModel");
const Department = require("../models/departmentModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");



//Send Custom Sms
router.post("/custom", verifyToken, async (req, res) => {
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

//Send to All Members

router.post("/", verifyToken, async (req, res) => {
  const { sender_id, mobile, message, department, church_grp
  } = req.body;
  if (!sender_id) return res.status(401).json({ msg: "Sender ID Field is Empty" });
  // if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" });
  if (!message) return res.status(401).json({ msg: "Message Field is Empty" });
  // if (!department) return res.status(401).json({ msg: "Deparment Field is Empty" });
  // if (!church_grp) return res.status(401).json({ msg: "Church Group Field is Empty" });


  const user = req.user;
  const nos_list = '';
  if (req.body.all_members) {
    const all_mems = await Member.find(user._id)
    console.log("ALLL MEMBER", all_mems)

    if (all_mems) {
      all_mems.forEach(val => {
        if (val.mobile) {
          const nos_list = val.mobile + ',';
          console.log("NUMBER LLLIST", nos_list)
        } else {
          return res.status(401).json({ msg: "Member No Not Available" })
        }
      })
    } else {
      return res.status(401).json({ msg: "No Member Find" })
    }
  } else {
    return res.status(401).json({ msg: "No All Member Selected" })
  }
  const nos = split(nos_list);
  console.log("NUMBEEEERR", nos);
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
router.get("/walletbalance", verifyToken, async (req, res) => {

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

