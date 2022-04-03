const router = require('express').Router();
const FirstTimer = require("../models/firstTimerModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");

//Create  FirstTimer
router.post("/", verifyTokenUser, async (req, res) => {
  const { email, mobile, alternative_mobile, first_name, last_name, date_joined,
    home_address, office_address, occupation, gender, dob, ministerId, memberId
  } = req.body;
  if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
  if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
  if (!first_name) return res.status(401).json({ msg: "First Name Field is Empty" })
  if (!last_name) return res.status(401).json({ msg: "Last Name Field is Empty" })
  //Check if email already exists in the DB
  const emailExists = await FirstTimer.checkEmailAlreadyExist(email)
  if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

  //Check if Mobile already exists in the DB
  const mobileExists = await FirstTimer.checkMobileAlreadyExist(mobile)
  if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

  const user = req.user;

  try {
    const savedFirstTimer = await FirstTimer.create({
      userId: user.id, 
      email, 
      mobile, 
      alternative_mobile, 
      first_name, 
      last_name,
      date_joined, 
      home_address, 
      office_address, 
      occupation, 
      gender, 
      dob,
      ministerId,
     memberId
    })
    return res.status(200).json({
      status: {
        code: 100,
        msg: "FirstTimer Added Successfully"
      },
      data: savedFirstTimer,
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

//UPDATE FirstTimer (ONLY User CAN UPDATE FirstTimer)
router.put("/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;

  const availId = await FirstTimer.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "FirstTimer with Id does not Exists" });

  try {
    const updatedFirstTimer = await FirstTimer.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'FirstTimer Updated successfully'
      },
      data: updatedFirstTimer,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})

//Delete FirstTimer (ONLY User CAN DELETE FirstTimer)
router.delete("/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;
  const availId = await FirstTimer.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "FirstTimer with Id does not Exists" });
  try {
    await FirstTimer.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "FirstTimer deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get FirstTimer
router.get("/find/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;

  const availId = await FirstTimer.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "FirstTimer with Id does not Exists" });
  try {
    const FirstTimers = await FirstTimer.findById(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "FirstTimer Fetched Successfully",
      },
      data: FirstTimers
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

  // Get All FirstTimer
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
  //Initiating a seach parameter with (FirstTimer)
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
    const firstTimers = await FirstTimer.find(query) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalFirstTimers = firstTimers.length;

    if (!firstTimers) return res.status(404).json({ msg: "There's No FirstTimer Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All FirstTimers fetched successfully'
      },
      data: firstTimers,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalFirstTimers),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})

//Get BY USER iD FirstTimer
router.get("/findByUserId", verifyTokenUser, async (req, res, next) => {
  //Initiating a seach parameter with (FirstTimer)
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
    const firstTimers = await FirstTimer.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalFirstTimers = firstTimers.length;

    if (!firstTimers) return res.status(404).json({ msg: "There's No FirstTimer Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All FirstTimers fetched successfully'
      },
      data: firstTimers,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalFirstTimers),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})



module.exports = router
