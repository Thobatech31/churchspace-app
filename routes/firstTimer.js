const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createFirstTimer, updateFirstTimer,
  deleteFirstTimer, getSingleFirstTimer,
  getAllFirstTimer, findFirstTimerById
} = require('../controllers/firstTimer');

router.post("/", verifyTokenUser, createFirstTimer);
router.put("/:id", verifyTokenUser, updateFirstTimer);
router.get("/find/:id", verifyTokenUser, getSingleFirstTimer);
router.delete('/:id', verifyTokenUser, deleteFirstTimer);
router.get("/findByUserId", verifyTokenUser, findFirstTimerById);
router.get("/", verifyTokenAndAdmin, getAllFirstTimer);

module.exports = router
