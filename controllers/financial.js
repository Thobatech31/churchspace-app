const router = require('express').Router();
const { each } = require('lodash');
const Financial = require("../models/financialModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");
const { offeringSchema, titheSchema, expenseSchema } = require("../middleware/authentication/financial_validation_schema");
var ObjectID = require("mongodb").ObjectID;

//Create  New Offering
const createOffering = async (req, res) => {
    const { kind, purpose, amount, type, offering_date
    } = req.body;
    const user = req.user;
    try {
        await offeringSchema.validateAsync(req.body)
        const savedOffering = await Financial.create({
            userId: user.id,
            kind: 'income',
            purpose: 'offering',
            type,
            amount,
            offering_date
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Offering Added Successfully"
            },
            data: savedOffering,
        })
    } catch (err) {
        if (err.isJoi === true) {
            return res.status(400).json({ msg: err.details[0].message })
        }
        return res.status(500).json({ msg: err })
    }
};

//Create  New Tithe
const createTithe = async (req, res) => {
    const { kind, purpose, amount, type, offering_date, tithe_giver_type
    } = req.body;

    const user = req.user;
    try {
        await titheSchema.validateAsync(req.body)
        const savedTithe = await Financial.create({
            userId: user.id,
            kind: 'income',
            purpose: 'tithe',
            type: 'tithe',
            amount,
            offering_date,
            tithe_giver_type
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Tithe Added Successfully"
            },
            data: savedTithe,
        })
    } catch (err) {
        if (err.isJoi === true) {
            return res.status(400).json({ msg: err.details[0].message })
        }
        return res.status(500).json({ msg: err })
    }
};

//Create  New Expense
const createExpenses = async (req, res) => {
    const { kind, purpose, amount, type, offering_date, remark, expenseCatoryId
    } = req.body;

    const user = req.user;
    try {
        await expenseSchema.validateAsync(req.body)
        const savedExpense = await Financial.create({
            userId: user.id,
            kind: 'expenses',
            purpose: 'expenses',
            type: 'expenses',
            amount,
            offering_date,
            remark,
            expenseCatoryId

        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Expense Added Successfully"
            },
            data: savedExpense,
        })
    } catch (err) {
        if (err.isJoi === true) {
            return res.status(400).json({ msg: err.details[0].message })
        }
        return res.status(500).json({ msg: err })
    }
};

//UPDATE Financial (ONLY User CAN UPDATE Financial)
const updateFinancial = async (req, res) => {
    const { id } = req.params;

    const availId = await Financial.findOne({ _id: id })
    if (!availId) return res.status(400).json({ msg: "Financial with Id does not Exists" });

    try {
        const updatedFinancial = await Financial.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Finacial Updated successfully'
            },
            data: updatedFinancial,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

//Delete Financial (ONLY User CAN DELETE Financial)
const deleteFinancial = async (req, res) => {
    const { id } = req.params;
    const availId = await Financial.findOne({ _id: id })
    if (!availId) return res.status(400).json({ msg: "Financial with Id does not Exists" });

    try {
        await Financial.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Financial deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get Financial
const getSingleFinancial = async (req, res) => {
    const { id } = req.params;

    const availId = await Financial.findOne({ _id: id })
    if (!availId) return res.status(400).json({ msg: "Financial with Id does not Exists" });
    try {
        const Financials = await Financial.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Financial Fetched Successfully",
            },
            data: Financials
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
};

//Get All Financial
const getAllFinancial = async (req, res) => {
    //Initiating a seach parameter with (Financial)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "kind": { $regex: req.query.search, $options: 'i' } }, { "purpose": { $regex: req.query.search, $options: 'i' } }, { "type": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const Financials = await Financial.find(query) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalFinancials = Financials.length;

        if (!Financials) return res.status(404).json({ msg: "There's No Financial Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Financial fetched successfully'
            },
            data: Financials,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalFinancials),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};

//Get BY USER iD Financial
const findFinancialById = async (req, res) => {
    //Initiating a seach parameter with (Financial)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "kind": { $regex: req.query.search, $options: 'i' } }, { "purpose": { $regex: req.query.search, $options: 'i' } }, { "type": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const Financials = await Financial.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalFinancials = Financials.length;

        if (!Financials) return res.status(404).json({ msg: "There's No Finacial Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Financial fetched successfully'
            },
            data: Financials,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalFinancials),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

};

//Get Financial Stats
const getFinancialStats = async (req, res) => {
    //Initiating a seach parameter with (Financials)
    const user = req.user;

    try {
        const Financials = await Financial.find({ userId: user.id }) //we use FIND because user can have more than one order
        // count the total number of return recods

        if (!Financials) return res.status(404).json({ msg: "There's No Financial Available" })

        let totalIncome = 0;
        let totalIncomeTithe = 0;
        let totalIncomeOffering = 0;
        let totalExpense = 0;


        Financials.filter((element) => {
            return element.kind === "income"
        }).forEach(each => {
            totalIncome += each.amount;
        });

        Financials.filter((element) => {
            return element.kind === "income" && element.purpose === "tithe";
        }).forEach(each => {
            totalIncomeTithe += each.amount;
        })

        Financials.filter((element) => {
            return element.kind === "income" && element.purpose === "offering";
        }).forEach(each => {
            totalIncomeOffering += each.amount;
        })

        Financials.filter((element) => {
            return element.kind === "expenses" && element.purpose === "expenses";
        }).forEach(each => {
            totalExpense += each.amount;
        })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'fetched successfully'
            },
            total_income: totalIncome,
            total_income_tithe: totalIncomeTithe,
            total_income_offering: totalIncomeOffering,
            total_expense: totalExpense
        })


    } catch (err) {
        return res.status(500).json({ msg: err });
    }
};

//Get Financial Stats USING AGGREGATION
const getFinancialAggregationStats = async (req, res) => {
    //Initiating a seach parameter with (Financials)
    const user = req.user;

    try {
        var userid = new ObjectID(user.id);
        const financialData = await Financial.aggregate([
            { $match: { "userId": userid, "kind": "income" } },
            {
                $group: {
                    _id: {
                        kind: "$kind",
                    },
                    totalIncome:
                    {
                        $sum: "$amount"
                    },
                },
            },
            { $project: { _id: 0 } }

        ])

        const financialDataExpense = await Financial.aggregate([
            { $match: { "userId": userid, "kind": "expenses" } },
            {
                $group: {
                    _id: {
                        kind: "$kind",
                    },
                    totalExpense:
                    {
                        $sum: "$amount"
                    },
                },},
            { $project: { _id: 0 } }
        ])

        const financialDataOffering = await Financial.aggregate([
            { $match: { "userId": userid, "kind": "income", "purpose": "offering" } },
            {
                $group: {
                    _id: {
                        kind: "$kind",
                        purpose: "$purpose"
                    },
                    totalOffering:
                    {
                        $sum: "$amount"
                    },
                },
            },
            { $project: { _id: 0 } }
        ])

        const financialDataTithe = await Financial.aggregate([
            { $match: { "userId": userid, "kind": "income", "purpose": "tithe" } },
            {
                $group: {
                    _id: {
                        kind: "$kind",
                        purpose: "$purpose"
                    },
                    totalTithe:
                    {
                        $sum: "$amount"
                    },
                },
            },
            { $project: { _id: 0 } }
        ])
        res.status(200).json({
            message: "ccesss",
            data: financialData.concat(financialDataExpense).concat(financialDataOffering).concat(financialDataTithe),
        })
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
};

module.exports = {
    createOffering, createTithe,
    createExpenses, updateFinancial,
    deleteFinancial, getSingleFinancial,
    getAllFinancial, findFinancialById,
    getFinancialStats, getFinancialAggregationStats
}
