const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createWelfare, updateWelfare,
  deleteWelfare, getSingleWelfare,
  getAllWelfare, findWelfareById, uploadWelfareDoc
} = require('../controllers/welfareController');
const upload = require("../middleware/upload");

router.post("/", verifyTokenUser, createWelfare);
router.put("/:id", verifyTokenUser, updateWelfare);
router.get("/find/:id", verifyTokenUser, getSingleWelfare);
router.get("/uploadrequestdoc/:id", verifyTokenUser, uploadWelfareDoc);
router.delete('/:id', verifyTokenUser, deleteWelfare);
router.get("/findByUserId", verifyTokenUser, findWelfareById);
router.get("/", verifyTokenAndAdmin, getAllWelfare);

module.exports = router
