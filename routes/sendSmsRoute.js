const router = require('express').Router();
const { split, join } = require('lodash');
const axios = require('axios');
const Member = require("../models/memberModel");
const FirstTimer = require("../models/firstTimerModel");
const Department = require("../models/departmentModel");
const Churchgroup = require("../models/churchGroupModel");
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

  console.log("number", d_list)

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

    // console.log(error); // this is the main part. Use the response property from the error object

    return res.status(500).json({ msg: error.response.data['error'] });
  }
})

//Send to All Members
router.post("/", verifyToken, async (req, res) => {
  const { sender_id, mobile, message, select_all_members, select_all_firsttimers, departments, church_grp
  } = req.body;
  if (!sender_id) return res.status(401).json({ msg: "Sender ID Field is Empty" });
  if (!message) return res.status(401).json({ msg: "Message Field is Empty" });

  const user = req.user;
  var nos_list = '';
  var idd = '';
  if (select_all_members) {
    var all_mems = await Member.find(user._id);
    // console.log("ALLL MEMBER", all_mems);
    if (all_mems) {
      all_mems.forEach(val => {
        if (val.mobile) {
          nos_list += val.mobile + ',';
          // console.log("NUMBER LLLIST", nos_list)
        }
      })
    } else {
      return res.status(401).json({ msg: "Member Not Found" })
    }
  }

  if (select_all_firsttimers) {
    var all_first_timers = await FirstTimer.find(user._id);
    // console.log("ALLL FirstTimer", all_mems);
    if (all_first_timers) {
      all_first_timers.forEach(val => {
        if (val.mobile) {
          nos_list += val.mobile + ',';
          // console.log("/v LLLIST", nos_list)
        }
      })
    } else {
      return res.status(401).json({ msg: "FirstTimer Not Found" })
    }
  }

  if (departments) {
    var all_departs = await Department.find({ department: departments });
    var members = await Member.find(user._id)

    if (all_departs) {
      all_departs.forEach(async (val) => {
        idd += val._id + ",";
        var dept_id = idd.slice(0, -1);
        if (members) {
          members.forEach((val) => {
            if (val.mdepartment) {
              var Num = val.mdepartment;

              if (Num.includes(dept_id)) {
                nos_list += val.mobile + ',';
              }
            }
          })
        }
      })
    }
  }

  if (church_grp) {
    var all_church_groups = await Churchgroup.find({ group: church_grp });
    // console.log("groups", all_church_groups)
    var members = await Member.find(user._id)

    if (all_church_groups) {
      all_church_groups.forEach(async (val) => {
        idd += val._id + ",";
        var grp_id = idd.slice(0, -1);

        if (members) {
          members.forEach((val) => {
            if (val.mchurch_group) {
              var Num = val.mchurch_group;
              if (Num.includes(grp_id)) {
                nos_list += val.mobile + ',';
              }
            }
          })
        }
      })
    }
  }



  const nos = split(nos_list.slice(0, -1));
  console.log("NUMBEEEERR", nos);
  // console.log("NUMBEEEERR QWE4 JFJR", nos_list.slice(0,-1));
  const n_list = [...new Set(nos)]
  // console.log("NUMBEEEERR", n_list);

  const d_list = n_list.join(",");
  // console.log("DEEE LIST", d_list);

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
    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Message Sent  Successfully'
      },
      data: data,
    })
  } catch (error) {
    // console.log(error.response.data['error']); // this is the main part. Use the response property from the error object
    return res.status(500).json({ msg: error.response.data['error'] });
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
      wallet_balance: data
    })
  } catch (error) {
    // console.log(error); // this is the main part. Use the response property from the error object
    return res.status(500).json({ msg: error.response.data['error'] });
  }
})


module.exports = router

