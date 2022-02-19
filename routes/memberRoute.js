const router = require('express').Router();
const Member = require("../models/memberModel");
var excelReader = require('../helper/excel-reader');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");

//Create  Member
router.post("/", verifyToken, async (req, res) => {
  const { email, mobile, alternative_mobile, first_name, last_name, date_joined,
    home_address, office_address, occupation, gender, dob, photo, mdepartment, mchurch_group
  
  } = req.body;
  if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
  if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
  if (!first_name) return res.status(401).json({ msg: "First Name Field is Empty" })
  if (!last_name) return res.status(401).json({ msg: "Last Name Field is Empty" })
  //Check if email already exists in the DB
  const emailExists = await Member.checkEmailAlreadyExist(email)
  if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

  //Check if Mobile already exists in the DB
  const mobileExists = await Member.checkMobileAlreadyExist(mobile)
  if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

  const user = req.user;

  try {
    const savedMember = await Member.create({
      userId: user.id, email, mobile, alternative_mobile, first_name,last_name,
      date_joined, home_address, office_address, occupation, gender,dob, photo,
      mdepartment, mchurch_group
    })
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Member Added Successfully"
      },
      data: savedMember,
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

router.get('/bulkupload', verifyToken, function (req, res, next) {
  const user = req.user;
  var employeesJsonArray = excelReader.readExcel('./public/member.xlsx')
  Member.insertMany(employeesJsonArray,{userId:1}, function (error, docs) {
    if (error) {
      next(error)
    }
    else {
      return res.status(200).json({
        status: {
          code: 100,
          msg: "File uploaded Successfully"
        },
        data: docs,  //just rendering the document i got
      })
    }
  });
});

//UPDATE Member (ONLY User CAN UPDATE Member)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

const availId = await Member.findOne({_id: id})
  if (!availId) return res.status(401).json({ msg: "Member with Id does not Exists" });
  
  try {
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Member Updated successfully'
      },
      data: updatedMember,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})

//Delete Member (ONLY User CAN DELETE Member)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const availId = await Member.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Member with Id does not Exists" });

  try {
    await Member.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Member deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get Member
router.get("/find/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const availId = await Member.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Member with Id does not Exists" });
  try {
    const Members = await Member.findById(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Member Fetched Successfully",
      },
      data: Members
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get BY USER iD Member
router.get("/findByUserId", verifyToken, async (req, res, next) => {
  //Initiating a seach parameter with (Member)
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } }
    ];
  }
  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  const user = req.user;

  try {
    const members = await Member.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of return recods
    const totalMembers = members.length;

    if (!members) return res.status(404).json({ msg: "There's No Member Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Member fetched successfully'
      },
      data: members,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalMembers),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})



//Get all Members (ONLY user CAN GET ALL Members)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  //Initiating a seach parameter with (Member)
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  try {
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of records for that model
    const totalMembers = await Member.countDocuments();

    if (!members) return res.status(404).json({ msg: "There's No Member Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Member fetched successfully'
      },
      data: members,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalMembers),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})


module.exports = router
