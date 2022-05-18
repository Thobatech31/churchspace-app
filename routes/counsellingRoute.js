const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createCounselling, updateCounselling,
  deleteCounselling, getSingleCounselling,
  getAllCounselling, findCounsellingById, getCounsellingStats
} = require('../controllers/counsellingController');

router.post("/", verifyTokenUser, createCounselling);
router.put("/:id", verifyTokenUser, updateCounselling);
router.get("/find/:id", verifyTokenUser, getSingleCounselling);
router.delete('/:id', verifyTokenUser, deleteCounselling);
router.get("/findByUserId", verifyTokenUser, findCounsellingById);
router.get("/", verifyTokenAndAdmin, getAllCounselling);

module.exports = router
