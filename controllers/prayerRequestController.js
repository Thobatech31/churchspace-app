const PrayerRequest = require("../models/prayerRequestModel");

//Create  PrayerRequest
const createPrayerRequest = async (req, res) => {
    const { email, mobile, first_name, last_name, date_joined,
        address, prayer_request, firsttimerId, memberId
    } = req.body;
    if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
    if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" })
    if (!first_name) return res.status(401).json({ msg: "First Name Field is Empty" })
    if (!last_name) return res.status(401).json({ msg: "Last Name Field is Empty" })
    if (!prayer_request) return res.status(401).json({ msg: "Prayer Request Field is Empty" })

    //Check if email already exists in the DB
    const emailExists = await PrayerRequest.checkEmailAlreadyExist(email)
    if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

    //Check if Mobile already exists in the DB
    const mobileExists = await PrayerRequest.checkMobileAlreadyExist(mobile)
    if (mobileExists) return res.status(401).json({ msg: "Mobile Already Exists" });

    const user = req.user;

    try {
        const savedPrayerRequest = await PrayerRequest.create({
            userId: user.id, email, mobile, first_name, last_name,
            date_joined, address, prayer_request,
            firsttimerId, memberId
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Prayer Request Added Successfully"
            },
            data: savedPrayerRequest,
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }

};

//UPDATE PrayerRequest (ONLY User CAN UPDATE PrayerRequest)
const updatePrayerRequest = async (req, res) => {
    const { id } = req.params;

    const availId = await PrayerRequest.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "PrayerRequest with Id does not Exists" });

    try {
        const updatedPrayerRequest = await PrayerRequest.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Prayer Request Updated successfully'
            },
            data: updatedPrayerRequest,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

//Delete PrayerRequest (ONLY User CAN DELETE PrayerRequest)
const deletePrayerRequest = async (req, res) => {
    const { id } = req.params;
    const availId = await PrayerRequest.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Prayer Request with Id does not Exists" });

    try {
        await PrayerRequest.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Prayer Request deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get PrayerRequest
const getSinglePrayerRequest = async (req, res) => {
    const { id } = req.params;

    const availId = await PrayerRequest.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Prayer Request with Id does not Exists" });
    try {
        const PrayerRequests = await PrayerRequest.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Prayer Request Fetched Successfully",
            },
            data: PrayerRequests
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get All PrayerRequest
const getAllPrayerRequest = async (req, res, next) => {
    //Initiating a seach parameter with (PrayerRequest)
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
        const prayerRequests = await PrayerRequest.find(query) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalPrayerRequests = prayerRequests.length;

        if (!prayerRequests) return res.status(404).json({ msg: "There's No Prayer Request Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Prayer Requests fetched successfully'
            },
            data: prayerRequests,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalPrayerRequests),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};

//Get BY USER iD PrayerRequest
const findPrayerRequestById = async (req, res, next) => {
    //Initiating a seach parameter with (PrayerRequest)
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
        const prayerRequests = await PrayerRequest.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalPrayerRequests = prayerRequests.length;

        if (!prayerRequests) return res.status(404).json({ msg: "There's No Prayer Request Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Prayer Requests fetched successfully'
            },
            data: prayerRequests,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalPrayerRequests),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};

module.exports = { createPrayerRequest, updatePrayerRequest,
    deletePrayerRequest, getSinglePrayerRequest,
    getAllPrayerRequest, findPrayerRequestById}
