const router = require('express').Router();
const ExpenseCategory = require("../models/expenseCategoryModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");

//Create  ExpenseCategory
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const { expense_name, expense_description,
    } = req.body;
    if (!expense_name) return res.status(401).json({ msg: "Expense Name Field is Empty" });
    if (!expense_description) return res.status(401).json({ msg: "Expense Description Field is Empty" })

    const user = req.user;
    try {
        const savedExpenseCategory = await ExpenseCategory.create({
            userId: user.id,
            expense_name,
            expense_description,
        })
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Expense Category Added Successfully"
            },
            data: savedExpenseCategory,
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }

})

//UPDATE ExpenseCategory (ONLY User CAN UPDATE ExpenseCategory)
router.put("/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;

    const availId = await ExpenseCategory.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Expense Category with Id does not Exists" });

    try {
        const updatedExpenseCategory = await ExpenseCategory.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Expense Category Updated successfully'
            },
            data: updatedExpenseCategory,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})

//Delete ExpenseCategory (ONLY User CAN DELETE ExpenseCategory)
router.delete("/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;
    const availId = await ExpenseCategory.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Expense Category with Id does not Exists" });

    try {
        await ExpenseCategory.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Expense Category deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err })
    }
})

//Get ExpenseCategory
router.get("/find/:id", verifyTokenUser, async (req, res) => {
    const { id } = req.params;

    const availId = await ExpenseCategory.findOne({ _id: id })
    if (!availId) return res.status(401).json({ msg: "Expense Category with Id does not Exists" });
    try {
        const ExpenseCategorys = await ExpenseCategory.findById(req.params.id)
        return res.status(200).json({
            status: {
                code: 100,
                msg: "Expense Category Fetched Successfully",
            },
            data: ExpenseCategorys
        })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
})

//Get All ExpenseCategory
router.get("/", verifyTokenUser, async (req, res, next) => {
    //Initiating a seach parameter with (ExpenseCategory)
    let query = {};
    if (req.query.search) {
        query.$or = [
            { "expense_name": { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const pageSize = req.query.pageSize || 10;
    const currentPage = req.query.currentPage || 1;
    const user = req.user;

    try {
        const ExpenseCategorys = await ExpenseCategory.find(query) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalExpenseCategorys = ExpenseCategorys.length;

        if (!ExpenseCategorys) return res.status(404).json({ msg: "There's No Expense Category Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Expense Category fetched successfully'
            },
            data: ExpenseCategorys,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalExpenseCategorys),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

})

//Get BY USER iD ExpenseCategory
router.get("/findByUserId", verifyTokenUser, async (req, res, next) => {
    //Initiating a seach parameter with (ExpenseCategory)
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
        const ExpenseCategorys = await ExpenseCategory.find(req.query.search ? query : { userId: user.id }) //we use FIND because user can have more than one order
            .sort({ createdAt: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);

        // count the total number of return recods
        const totalExpenseCategorys = ExpenseCategorys.length;

        if (!ExpenseCategorys) return res.status(404).json({ msg: "There's No Expense Category Available" })

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'All Expense Category fetched successfully'
            },
            data: ExpenseCategorys,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalExpenseCategorys),
            page: parseInt(currentPage),
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }

})

module.exports = router
