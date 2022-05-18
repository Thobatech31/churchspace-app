const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createMember, updateMember,
  bulkUpload, readBulkUpload,
  deleteMember, getSingleMember,
  getAllMember, findMemberById
} = require('../controllers/memberController');
const upload = require("../middleware/upload");

router.post("/", verifyTokenUser, createMember);
router.put("/:id", verifyTokenUser, updateMember);
router.get("/find/:id", verifyTokenUser, getSingleMember);
router.get("/readbulkuploadfile", verifyTokenUser, readBulkUpload);
router.post("/bulkupload", verifyTokenUser, upload.single("file"), bulkUpload);
router.delete('/:id', verifyTokenUser, deleteMember);
router.get("/findByUserId", verifyTokenUser, findMemberById);
router.get("/", verifyTokenAndAdmin, getAllMember);

module.exports = router
