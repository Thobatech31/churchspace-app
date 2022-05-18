const router = require('express').Router();
const Member = require("../models/memberModel");
const path = require('path');
const __basedir = path.resolve();
var excelReader = require('../helper/excel-reader');
const readXlsxFile = require("read-excel-file/node");

//Create  Member
const createMember = async (req, res) => {
    const { email, mobile, alternative_mobile, first_name, last_name, date_joined,
        home_address, office_address, occupation, gender, dob, photo, mdepartment, mchurch_group

    } = req.body;
    if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
    if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
    if (!first_name) return res.status(401).json({ msg: "First Name Field is Empty" })
    if (!last_name) return res.status(401).json({ msg: "Last Name Field is Empty" })
    //Check if email already exists in the DB
    const emailExists = await Member.checkEmailAlreadyExist(email)
    if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

    //Check if Mobile already exists in the DB
    const mobileExists = await Member.checkMobileAlreadyExist(mobile)
    if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

    const user = req.user;

    try {
        const savedMember = await Member.create({
            userId: user.id, email, mobile, alternative_mobile, first_name,last_name,
            date_joined, home_address, office_address, occupation, gender,dob, photo,
            mdepartment, mchurch_group
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Member Added Successfully"
            },
            data: savedMember,
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }

};


const readBulkUpload = function (req, res, next) {
    const { email, mobile, alternative_mobile, first_name, last_name, date_joined,
        home_address, office_address, occupation, gender, dob, photo, mdepartment, mchurch_group
    } = req.body;
    // const NumTrim = Member.trim_no(mobile)
    // if (NumTrim)
    // console.log(NumTrim);
    // return res.status(401).json({ msg: NumTrim});

    const user = req.user;
    var membersJsonArray = excelReader.readExcel('./public/member.xlsx');



    var memberWithDesignation = membersJsonArray.map(member => ({
        ...member,
        userId: user.id,
        mchurch_group: mchurch_group,
        mdepartment: mdepartment
    }));
    try{
        Member.insertMany(memberWithDesignation, function (error, docs) {
            if (error) {
                next(error)
            }
            else {
                return res.status(200).json({
                    status: {
                        code: 100,
                        msg: "File uploaded Successfully"
                    },
                    data: docs,  //just rendering the document i got
                })
            }
        });
    }catch (err){
        return res.status(500).json({ msg: err });
    }
};


const bulkUpload = async (req, res) => {
    const { mdepartment, mchurch_group
    } = req.body;
    const user = req.user;

    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }
        let path =
            __basedir + "/uploads/" + req.file.filename;
        readXlsxFile(path).then((rows) => {
            // skip header
            rows.shift();
            let membersData = [];
            rows.forEach((row) => {
                let members = {
                    first_name: row[0],
                    last_name: row[1],
                    email: row[2],
                    mobile: row[3],
                    alternative_mobile: row[4],
                    home_address: row[5],
                    office_address: row[6],
                };
                membersData.push({
                    ...members,
                    userId: user.id,
                    mchurch_group: mchurch_group,
                    mdepartment: mdepartment
                });
            });
            Member.create(membersData)
                .then(() => {
                    return res.status(200).json({
                        status: {
                            code: 100,
                            msg: "Bulk Members Uploaded successfully: " + req.file.originalname,
                        },
                        data: membersData,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        message: "Fail to import data into database!",
                        error: error.message,
                    });
                });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};


//UPDATE Member (ONLY User CAN UPDATE Member)
const updateMember = async (req, res) => {
    const { id } = req.params;

    const availId = await Member.findOne({_id: id})
    if (!availId) return res.status(401).json({ msg: "Member with Id does not Exists" });

    try {
        const updatedMember = await Member.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Member Updated successfully'
            },
            data: updatedMember,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

//Delete Member (ONLY User CAN DELETE Member)
const deleteMember = async (req, res) => {
    const { id } = req.params;
    const availId = await Member.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Member with Id does not Exists" });

    try {
        await Member.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Member deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get Member
const getSingleMember = async (req, res) => {
    const { id } = req.params;

    const availId = await Member.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Member with Id does not Exists" });
    try {
        const Members = await Member.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Member Fetched Successfully",
            },
            data: Members
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get BY USER iD Member
const findMemberById = async (req, res, next) => {
    //Initiating a seach parameter with (Member)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } }
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const members = await Member.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalMembers = members.length;

        if (!members) return res.status(404).json({ msg: "There's No Member Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Member fetched successfully'
            },
            data: members,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalMembers),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};

//Get all Members (ONLY user CAN GET ALL Members)
const getAllMember = async (req, res) => {
    //Initiating a seach parameter with (Member)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "first_name": { $regex: req.query.search, $options: 'i' } }, { "last_name": { $regex: req.query.search, $options: 'i' } }, { "email": { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    try {
        const members = await Member.find(query)
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of records for that model
        const totalMembers = await Member.countDocuments();

        if (!members) return res.status(404).json({ msg: "There's No Member Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Member fetched successfully'
            },
            data: members,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalMembers),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};


module.exports = { createMember, updateMember,
    bulkUpload, readBulkUpload,
    deleteMember, getSingleMember,
    getAllMember, findMemberById}
