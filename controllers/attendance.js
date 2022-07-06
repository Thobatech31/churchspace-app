const router = require('express').Router();
const Attendance = require("../models/attendanceModel");
const { QueryTypes } = require('sequelize');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");
const {attendanceSchema} = require('../middleware/authentication/attendance_validation_schema');

//Create  Attendance
const createAttendance = async (req, res) => {
    const { service_title, men_attd, women_attd, children_attd, date_attendance
    } = req.body;
    const user = req.user;
    try {
        await attendanceSchema.validateAsync(req.body);
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
        if(err.isJoi === true){
            return res.status(400).json({msg: err.details[0].message})
        }
        return res.status(500).json({ msg: err })
    }
};

//UPDATE Attendance (ONLY User CAN UPDATE Attendance)
const updateAttendance = async (req, res) => {
    const { id } = req.params;

    const availId = await Attendance.findOne({ _id: id })
    if (!availId) return res.status(400).json({ msg: "Attendance with Id does not Exists" });

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
};

//Delete Attendance (ONLY User CAN DELETE Attendance)
const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    const availId = await Attendance.findOne({ _id: id })
    if (!availId) return res.status(400).json({ msg: "Attendance with Id does not Exists" });

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
};

//Get Attendance
const getSingleAttendance = async (req, res) => {
    const { id } = req.params;

    const availId = await Attendance.findOne({ _id: id })
    if (!availId) return res.status(400).json({ msg: "Attendance with Id does not Exists" });
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
};

//Get All Attendance
const getAllAttendance = async (req, res) => {
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

};

//Get BY USER iD Attendance
const findAttendanceById = async (req, res) => {
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
};

//Get attendance Stats
const getAttendanceStats = async (req, res) => {
    //Initiating a seach parameter with (Attendance)
    const user = req.user;

    try {
        const Attendances = await Attendance.find({ userId: user.id }) //we use FIND because user can have more than one order
        // count the total number of return recods

        if (!Attendances) return res.status(404).json({ msg: "There's No Attendance Available" })


        const getAttendanceStats = () => {
            /* calculate total for Tota Attendance*/
            let total = Attendances.reduce((total, current) => total + parseInt(current.total_attd), 0);

            /* calculate total of TotalMen*/
            let totalMen = Attendances.reduce((total, current) => total + parseInt(current.men_attd), 0);

            /* calculate total of TotalWomen*/
            let totalWomen = Attendances.reduce((total, current) => total + parseInt(current.women_attd), 0);

            /* calculate total of TotalChildren*/
            let totalChildren = Attendances.reduce((total, current) => total + parseInt(current.children_attd), 0);

            return res.status(200).json({
                status: {
                    code: 100,
                    msg: 'fetched successfully'
                },
                total_attendnce: total,
                total_men: totalMen,
                total_women: totalWomen,
                total_children: totalChildren,
            })
        }
        getAttendanceStats()

        // let total = 0;
        // let totalMen = 0;
        // let totalWomen = 0;
        // let totalChildren = 0;

        // Attendances.forEach(each => {
        //     total += each.total_attd;
        //     totalMen += each.men_attd;
        //     totalWomen += each.women_attd;
        //     totalChildren += each.children_attd;
        // });

        // return res.status(200).json({
        //     status: {
        //         code: 100,
        //         msg: 'fetched successfully'
        //     },
        //     total_men: totalMen,
        //     total_women: totalWomen,
        //     total_children: totalChildren,
        //     total_attendnce: total,
        // })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

module.exports = {createAttendance, updateAttendance ,
    deleteAttendance, getSingleAttendance, getAllAttendance, findAttendanceById, getAttendanceStats}
