const router = require('express').Router();
const { split, join } = require('lodash');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");

//Create  Minister
router.post("/", async (req, res) => {
  const nos_list = "09088223454,08094345465";
  const nos = split(nos_list);
  const n_list = [...new Set(nos)]

  const d_list = n_list.join(",");
  console.log(d_list)
 
  try {   

    return res.status(200).json({
      status: {
        code: 100,
        msg: "Message Sent Successfully"
      },
      data:d_list
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

//Create  Minister
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

  try {
    const url = `${process.env.DOJAH_BASE_URL}/messaging/sms/`;
    const postVars = {
      'destination' : d_list,
      'message' : message,
      'channel' : 'sms',
      'sender_id' : sender_id
    };
    const options = {
      'method' : 'POST',
      'content' : json_encode(postVars),
      headers : {
        'Content-Type': 'application/json',
        'Authorization': process.env.DOJAH_SECRET_KEY,
        'AppId': process.env.DOJAH_APP_ID,
      }
     
    }; 
    request(url , options, function (error, response, body) {
      if (!error) {
        const data = JSON.parse(body).data;
        console.log(data)
        if (data.status) {
          return res.status(200).json({
            status: {
              code: 100,
              msg: "Message Sent Successfully"
            },
            data:url
          })
        }
        else if (data.status == "success") {
          //update Transaction Model For the user details
         
        }
        else {
          res.status(401).json({msg: "Transaction error"});
        }
      } else {
        return res.status(401).json({msg: "err"});
      }
    });
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

module.exports = router
