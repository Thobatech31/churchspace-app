const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createMinister, updateMinister,
  deleteMinister, getSingleMinister,
  getAllMinister, findMinisterById
} = require('../controllers/ministerController');
const upload = require("../middleware/upload");

router.post("/", verifyTokenUser, createMinister);
router.put("/:id", verifyTokenUser, updateMinister);
router.get("/find/:id", verifyTokenUser, getSingleMinister);
router.delete('/:id', verifyTokenUser, deleteMinister);
router.get("/findByUserId", verifyTokenUser, findMinisterById);
router.get("/", verifyTokenAndAdmin, getAllMinister);

module.exports = router
