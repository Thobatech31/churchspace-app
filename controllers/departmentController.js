const router = require('express').Router();
const Department = require("../models/departmentModel");

//Create  Department
const createDepartment = async (req, res) => {
    const { department, description, ministerId, memberId } = req.body;
    if (!department) return res.status(401).json({ msg: "Department Field is Empty" });

    if (!description) return res.status(401).json({ msg: "Description Field is Empty" })
    const user = req.user;

    try {
        const savedDepartment = await Department.create({
            userId: user.id,
            department,
            description,
            ministerId,
            memberId
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Department Added Successfully"
            },
            data: savedDepartment,
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }

};

//UPDATE Department (ONLY User CAN UPDATE Department)
const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const availId = await Department.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Department with Id does not Exists" });

    try {
        const updatedDepartment = await Department.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Department Updated successfully'
            },
            data: updatedDepartment,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

//Delete Department (ONLY User CAN DELETE Department)
const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    const availId = await Department.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Department with Id does not Exists" });

    try {
        await Department.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Department deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get Department
const getSingleDepartment = async (req, res) => {
    const { id } = req.params;
    const availId = await Department.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Department with Id does not Exists" });

    try {
        const Departments = await Department.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Department Fetched Successfully",
            },
            data: Departments
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get BY USER iD Department
const findDepartmentById = async (req, res, next) => {
    //Initiating a seach parameter with (Department)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "department": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const departments = await Department.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalDepartments = departments.length;

        if (!departments) return res.status(404).json({ msg: "There's No Department Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Department fetched successfully'
            },
            data: departments,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalDepartments),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};


//Get all Departments (ONLY user CAN GET ALL Departments)
const getAllDepartment = async (req, res) => {
    //Initiating a seach parameter with (Department)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "department": { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    try {
        const departments = await Department.find(query)
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of records for that model
        const totalDepartments = await Department.countDocuments();

        if (!departments) return res.status(404).json({ msg: "There's No Department Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Department fetched successfully'
            },
            data: departments,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalDepartments),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};


module.exports = {  createDepartment, updateDepartment,
    deleteDepartment, getSingleDepartment,
    getAllDepartment, findDepartmentById}
