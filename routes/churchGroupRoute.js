const router = require('express').Router();
const Group = require("../models/churchGroupModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");

//Create  CHURCH GROUP
router.post("/", verifyToken, async (req, res) => {
  const { group, description } = req.body;
  if (!group) return res.status(401).json({ msg: "Group Field is Empty" });

  if (!description) return res.status(401).json({ msg: "Description Field is Empty" })

  const user = req.user;

  try {
    const savedGroup = await Group.create({
      userId:user.id,
      group,
      description
    })
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Group Added Successfully"
      },
      data: savedGroup,
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

//UPDATE GROUP (ONLY User CAN UPDATE Group)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const availId = await Group.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Group with Id does not Exists" });
  
  try {
    const updatedGroup = await Group.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Group Updated successfully'
      },
      data: updatedGroup,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})

//Delete group (ONLY User CAN DELETE Group)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const availId = await Group.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Group with Id does not Exists" });

  try {
    await Group.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Group deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get Group
router.get("/find/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const availId = await Group.findOne({ _id: id })
  if (!availId) return res.status(401).json({ msg: "Group with Id does not Exists" });

  try {
    const group = await Group.findById(req.params.id )
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Group Fetched Successfully",
      },
      data: group
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get BY USER iD Group
router.get("/findByUserId", verifyToken, async (req, res, next) => {
  //Initiating a seach parameter with (group)
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "group": { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  const user = req.user;

  try {
    const groups = await Group.find(req.query.search ? query :{ userId: user.id } ) //we use FIND because user can have more than one order
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // const filteredGroups = groups.filter(grp => {
    //   let isValid = true;
    //   for (key in query) {
    //     console.log(key, grp[key], query[key]);
    //     isValid = isValid && grp[key] == query[key];
    //   }
    //   return isValid;
    // });

    // count the total number of records for that model
    // const totalGroups = await Group.countDocuments();

    // count the total number of return recods
    const totalGroups = groups.length;

    if (!groups) return res.status(404).json({ msg: "There's No Groups Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Groups fetched successfully'
      },
      data: groups,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalGroups),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
  
})



//Get all groups (ONLY user CAN GET ALL Groups)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  //Initiating a seach parameter with (group)
  let query = {};
  if (req.query.search) {
    query.$or = [
      { "group": { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  try {
    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    // count the total number of records for that model
    const totalGroups = await Group.countDocuments();

    if (!groups) return res.status(404).json({ msg: "There's No Groups Available" })

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'All Groups fetched successfully'
      },
      data: groups,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalGroups),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }

})


module.exports = router
