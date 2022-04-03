const router = require('express').Router();
const Counselling = require("../models/counsellingModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");

//Create  Counselling
router.post("/", verifyTokenUser, async (req, res) => {
  const { email, mobile, first_name, last_name, date_joined,
    address, counselling_prayerrequest, firsttimerId, memberId
  } = req.body;
  if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
  if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
  if (!first_name) return res.status(401).json({ msg: "First Name Field is Empty" })
  if (!last_name) return res.status(401).json({ msg: "Last Name Field is Empty" })
  if (!counselling_prayerrequest) return res.status(401).json({ msg: "Counselling Prayerrequest Field is Empty" })

  //Check if email already exists in the DB
  const emailExists = await Counselling.checkEmailAlreadyExist(email)
  if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

  //Check if Mobile already exists in the DB
  const mobileExists = await Counselling.checkMobileAlreadyExist(mobile)
  if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

  const user = req.user;

  try {
    const savedCounselling = await Counselling.create({
      userId: user.id, email, mobile, first_name, last_name,
      date_joined, address, counselling_prayerrequest,
      firsttimerId, memberId
    })
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Counselling Added Successfully"
      },
      data: savedCounselling,
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

//UPDATE Counselling (ONLY User CAN UPDATE Counselling)
router.put("/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;

  const availId = await Counselling.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Counselling with Id does not Exists" });

  try {
    const updatedCounselling = await Counselling.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Counselling Updated successfully'
      },
      data: updatedCounselling,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})


//Delete Counselling (ONLY User CAN DELETE Counselling)
router.delete("/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;
  const availId = await Counselling.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Counselling with Id does not Exists" });

  try {
    await Counselling.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Counselling deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})


//Get Counselling
router.get("/find/:id", verifyTokenUser, async (req, res) => {
  const { id } = req.params;

  const availId = await Counselling.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Counselling with Id does not Exists" });
  try {
    const Counsellings = await Counselling.findById(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Counselling Fetched Successfully",
      },
      data: Counsellings
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})


//Get All Counselling
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
  //Initiating a seach parameter with (Counselling)
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
    const counsellings = await Counselling.find(query) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalCounsellings = counsellings.length;

    if (!counsellings) return res.status(404).json({ msg: "There's No Counselling Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Counsellings fetched successfully'
      },
      data: counsellings,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalCounsellings),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})


//Get BY USER iD Counselling
router.get("/findByUserId", verifyTokenUser, async (req, res, next) => {
  //Initiating a seach parameter with (Counselling)
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
    const counsellings = await Counselling.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalCounsellings = counsellings.length;

    if (!counsellings) return res.status(404).json({ msg: "There's No Counselling Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Counsellings fetched successfully'
      },
      data: counsellings,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalCounsellings),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})

module.exports = router
