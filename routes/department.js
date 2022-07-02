const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
  createDepartment, updateDepartment,
  deleteDepartment, getSingleDepartment,
  getAllDepartment, findDepartmentById
} = require('../controllers/department');

router.post("/", verifyTokenUser, createDepartment);
router.put("/:id", verifyTokenUser, updateDepartment);
router.get("/find/:id", verifyTokenUser, getSingleDepartment);
router.delete('/:id', verifyTokenUser, deleteDepartment);
router.get("/findByUserId", verifyTokenUser, findDepartmentById);
router.get("/", verifyTokenAndAdmin, getAllDepartment);

module.exports = router
