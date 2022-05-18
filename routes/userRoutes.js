const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  updateUser, payStack, payStackVerify, getSingleUser,
  deleteUser, getAllUsers
} = require('../controllers/userController');

router.put("/:id", verifyTokenAndAdmin, updateUser);
router.post("/paystack/pay", verifyTokenUser, payStack);
router.get("/paystack/verify", verifyTokenUser, payStackVerify);

router.get("/:id", verifyTokenAndAdmin, getSingleUser);
router.delete('/:id', verifyTokenAndAdmin, deleteUser);

router.get("/all/getusers", verifyTokenAndAdmin, getAllUsers);

module.exports = router
