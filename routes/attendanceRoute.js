const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
    createAttendance, updateAttendance,
    deleteAttendance, getSingleAttendance,
    getAllAttendance, findAttendanceById, getAttendanceStats
} = require('../controllers/attendanceController');

router.post("/", verifyTokenUser, createAttendance);
router.put("/:id", verifyTokenUser, updateAttendance);
router.get("/find/:id", verifyTokenUser, getSingleAttendance);
router.delete('/:id', verifyTokenUser, deleteAttendance);
router.get("/stats", verifyTokenUser, getAttendanceStats);
router.get("/findByUserId", verifyTokenUser, findAttendanceById);
router.get("/", verifyTokenAndAdmin, getAllAttendance);

module.exports = router
