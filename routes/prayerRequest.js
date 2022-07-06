const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createPrayerRequest, updatePrayerRequest,
  deletePrayerRequest, getSinglePrayerRequest,
  getAllPrayerRequest, findPrayerRequestById
} = require('../controllers/prayerRequest');
const upload = require("../middleware/upload");

router.post("/", verifyTokenUser, createPrayerRequest);
router.put("/:id", verifyTokenUser, updatePrayerRequest);
router.get("/find/:id", verifyTokenUser, getSinglePrayerRequest);
router.delete('/:id', verifyTokenUser, deletePrayerRequest);
router.get("/findByUserId", verifyTokenUser, findPrayerRequestById);
router.get("/", verifyTokenAndAdmin, getAllPrayerRequest);

module.exports = router
