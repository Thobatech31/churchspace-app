const router = require('express').Router();
const Attendance = require("../models/attendanceModel");
const { sequelize } = require('../models/attendanceModel') //Directory to models - This is the instance 
const Sequelize = require('sequelize') // This the classed sequelize
const { QueryTypes } = require('sequelize');

const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");

//Create  Attendance
router.post("/", verifyTokenUser, async (req, res) => {
    const { service_title, men_attd, women_attd, children_attd, date_attendance,total_attd
    } = req.body;
    if (!service_title) return res.status(401).json({ msg: "Service Title Field is Empty" });
    if (!men_attd) return res.status(401).json({ msg: "men attendace Field is Empty" })
    if (!women_attd) return res.status(401).json({ msg: "women attendance Field is Empty" })
    if (!children_attd) return res.status(401).json({ msg: "children attendance Field is Empty" })
    if (!date_attendance) return res.status(401).json({ msg: "date attendance Field is Empty" })

    const user = req.user;
    try {
        const savedAttendance = await Attendance.create({
            userId: user.id,
            service_title,
            men_attd,
            women_attd,
            children_attd,
            total_attd:  men_attd + women_attd + children_attd,
            date_attendance
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Attendance Added Successfully"
            },
            data: savedAttendance,
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }

})

//UPDATE Attendance (ONLY User CAN UPDATE Attendance)
router.put("/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;

    const availId = await Attendance.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Attendance with Id does not Exists" });

    try {
        const updatedAttendance = await Attendance.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Attendance Updated successfully'
            },
            data: updatedAttendance,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})

//Delete Attendance (ONLY User CAN DELETE Attendance)
router.delete("/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;
    const availId = await Attendance.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Attendance with Id does not Exists" });

    try {
        await Attendance.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Attendance deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
})

//Get Attendance
router.get("/find/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;

    const availId = await Attendance.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Attendance with Id does not Exists" });
    try {
        const Attendances = await Attendance.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Attendance Fetched Successfully",
            },
            data: Attendances
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
})

//Get All Attendance
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
    //Initiating a seach parameter with (Attendance)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "service_title": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const Attendances = await Attendance.find(query) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalAttendances = Attendances.length;

        if (!Attendances) return res.status(404).json({ msg: "There's No Attendance Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Attendance fetched successfully'
            },
            data: Attendances,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalAttendances),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

})

//Get BY USER iD Attendance
router.get("/findByUserId", verifyTokenUser, async (req, res, next) => {
    //Initiating a seach parameter with (Attendance)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "service_title": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const Attendances = await Attendance.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalAttendances = Attendances.length;

        if (!Attendances) return res.status(404).json({ msg: "There's No Attendance Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Attendance fetched successfully'
            },
            data: Attendances,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalAttendances),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})


//Get attendance Stats
router.get("/stats", verifyTokenUser, async (req, res, next) => {
    //Initiating a seach parameter with (Attendance)
    const user = req.user;

    try {
        const Attendances = await Attendance.find({ userId: user.id }) //we use FIND because user can have more than one order
        // count the total number of return recods

        if (!Attendances) return res.status(404).json({ msg: "There's No Attendance Available" })

        let total = 0;
        let totalMen = 0;
        let totalWomen = 0;
        let totalChildren = 0;

        Attendances.forEach(each => {
            total += each.total_attd;
            totalMen += each.men_attd;
            totalWomen += each.women_attd;
            totalChildren += each.children_attd;
        });




        return res.status(200).json({
            status: {
                code: 100,
                msg: 'fetched successfully'
            },
            total_men: totalMen,
            total_women: totalWomen,
            total_children: totalChildren,
            total_attendnce: total,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})
//Get attendance Stats
router.get("/stats", verifyTokenUser, async (req, res, next) => {
    //Initiating a seach parameter with (Attendance)
    const user = req.user;

    try {
        const Attendances = await Attendance.find({ userId: user.id }) //we use FIND because user can have more than one order
        // count the total number of return recods

        if (!Attendances) return res.status(404).json({ msg: "There's No Attendance Available" })

        let total = 0;
        let totalMen = 0;
        let totalWomen = 0;
        let totalChildren = 0;

        Attendances.forEach(each => {
            total += each.total_attd;
            totalMen += each.men_attd;
            totalWomen += each.women_attd;
            totalChildren += each.children_attd;
        });




        return res.status(200).json({
            status: {
                code: 100,
                msg: 'fetched successfully'
            },
            total_men: totalMen,
            total_women: totalWomen,
            total_children: totalChildren,
            total_attendnce: total,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})

module.exports = router
