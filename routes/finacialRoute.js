const router = require('express').Router();
const { each } = require('lodash');
const Financial = require("../models/financialModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");

//Create  New Offering
router.post("/offering", verifyTokenUser, async (req, res) => {
    const { kind, purpose,amount,type,offering_date
    } = req.body;
    if (!amount) return res.status(401).json({ msg: "Amount Field is Empty" })
    if (!type) return res.status(401).json({ msg: "Type Field is Empty" })
    if (!offering_date) return res.status(401).json({ msg: "offering date Field is Empty" })

    const user = req.user;
    try {
        const savedOffering = await Financial.create({
            userId: user.id,
            kind:'income',
            purpose:'offering',
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
        return res.status(500).json({ msg: err })
    }
})

//Create  New Tithe
router.post("/tithe", verifyTokenUser, async (req, res) => {
    const { kind, purpose,amount,type,offering_date,tithe_giver_type
    } = req.body;
    if (!amount) return res.status(401).json({ msg: "Amount Field is Empty" })
    if (!offering_date) return res.status(401).json({ msg: "offering date Field is Empty" })
    if (!tithe_giver_type) return res.status(401).json({ msg: "Tithe Giver Type Field is Empty" })

    const user = req.user;
    try {
        const savedTithe = await Financial.create({
            userId: user.id,
            kind:'income',
            purpose:'tithe',
            type:'tithe',
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
        return res.status(500).json({ msg: err })
    }
})


//Create  New Expense
router.post("/expenses", verifyTokenUser, async (req, res) => {
    const { kind, purpose,amount,type,offering_date,remark,expenseCatoryId
    } = req.body;
    if (!amount) return res.status(401).json({ msg: "Amount Field is Empty" })
    if (!offering_date) return res.status(401).json({ msg: "offering date Field is Empty" })
    if (!remark) return res.status(401).json({ msg: "Remark Field is Empty" })
    if (!expenseCatoryId) return res.status(401).json({ msg: "expense CatoryId Field is Empty" })

    const user = req.user;
    try {
        const savedExpense = await Financial.create({
            userId: user.id,
            kind:'expenses',
            purpose:'expenses',
            type:'expenses',
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
        return res.status(500).json({ msg: err })
    }
})

//UPDATE Financial (ONLY User CAN UPDATE Financial)
router.put("/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;

    const availId = await Financial.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Financial with Id does not Exists" });

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
})

//Delete Financial (ONLY User CAN DELETE Financial)
router.delete("/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;
    const availId = await Financial.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Financial with Id does not Exists" });

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
})

//Get Financial
router.get("/find/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;

    const availId = await Financial.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Financial with Id does not Exists" });
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
})

//Get All Financial
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
    //Initiating a seach parameter with (Financial)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "kind": { $regex: req.query.search, $options: 'i' } },{ "purpose": { $regex: req.query.search, $options: 'i' } },{ "type": { $regex: req.query.search, $options: 'i' } },
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

})

//Get BY USER iD Financial
router.get("/findByUserId", verifyTokenUser, async (req, res, next) => {
    //Initiating a seach parameter with (Financial)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "kind": { $regex: req.query.search, $options: 'i' } },{ "purpose": { $regex: req.query.search, $options: 'i' } },{ "type": { $regex: req.query.search, $options: 'i' } },
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

})

//Get Financial Stats
router.get("/stats", verifyTokenUser, async (req, res, next) => {
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


        Financials.filter((element) =>{
            return element.kind === "income"
        }).forEach(each =>{
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
})


module.exports = router
