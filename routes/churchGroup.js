const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createChurchGroup, updateChurchGroup,
  deleteChurchGroup, getSingleChurchGroup,
  getAllChurchGroup, findChurchGroupById, getChurchGroupStats
} = require('../controllers/churchGroup');

router.post("/", verifyTokenUser, createChurchGroup);
router.put("/:id", verifyTokenUser, updateChurchGroup);
router.get("/find/:id", verifyTokenUser, getSingleChurchGroup);
router.delete('/:id', verifyTokenUser, deleteChurchGroup);
router.get("/findByUserId", verifyTokenUser, findChurchGroupById);
router.get("/", verifyTokenAndAdmin, getAllChurchGroup);

module.exports = router
