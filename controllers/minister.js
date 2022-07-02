const router = require('express').Router();
const Minister = require("../models/ministerModel");
const { ministerSchema} = require("../middleware/authentication/ministers_validaton_schema")

//Create  Minister
const createMinister = async (req, res) => {
    const { title, email, mobile, alternative_mobile, first_name, last_name, date_joined,
        home_address, office_address, occupation, gender, dob
    } = req.body;
  
    const user = req.user;

    try {
        await ministerSchema.validateAsync(req.body);
        //Check if email already exists in the DB
        const emailExists = await Minister.checkEmailAlreadyExist(email)
        if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

        //Check if Mobile already exists in the DB
        const mobileExists = await Minister.checkMobileAlreadyExist(mobile)
        if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });
        const savedMinister = await Minister.create({
            userId: user.id,
            email, mobile,
            alternative_mobile,
            first_name,
            last_name,
            date_joined,
            home_address,
            office_address,
            occupation,
            gender,
            dob,
            title,

        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Minister Added Successfully"
            },
            data: savedMinister,
        })
    } catch (err) {
        if (err.isJoi === true) {
            return res.status(400).json({ msg: err.details[0].message })
        }
        return res.status(500).json({ msg: err })
    }

};

//UPDATE Minister (ONLY User CAN UPDATE Minister)
const updateMinister = async (req, res) => {
    const { id } = req.params;

    const availId = await Minister.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Minister with Id does not Exists" });

    try {
        const updatedMinister = await Minister.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Minister Updated successfully'
            },
            data: updatedMinister,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

//Delete Minister (ONLY User CAN DELETE Minister)
const deleteMinister = async (req, res) => {
    const { id } = req.params;
    const availId = await Minister.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Minister with Id does not Exists" });

    try {
        await Minister.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Minister deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get Minister
const getSingleMinister = async (req, res) => {
    const { id } = req.params;

    const availId = await Minister.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Minister with Id does not Exists" });
    try {
        const Ministers = await Minister.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Minister Fetched Successfully",
            },
            data: Ministers
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get BY USER iD Minister
const findMinisterById = async (req, res, next) => {
    //Initiating a seach parameter with (Minister)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const ministers = await Minister.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalMinisters = ministers.length;

        if (!ministers) return res.status(404).json({ msg: "There's No Minister Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Minister fetched successfully'
            },
            data: ministers,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalMinisters),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};

//Get all Ministers (ONLY user CAN GET ALL Ministers)
const getAllMinister = async (req, res) => {
    //Initiating a seach parameter with (Minister)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    console.log("jfjfjfjfjfj")

    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    try {
        const ministers = await Minister.find(query)
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of records for that model
        const totalMinisters = await Minister.countDocuments();

        if (!ministers) return res.status(404).json({ msg: "There's No Minister Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Minister fetched successfully'
            },
            data: ministers,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalMinisters),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};


module.exports = {  createMinister, updateMinister,
    deleteMinister, getSingleMinister,
    getAllMinister, findMinisterById}
