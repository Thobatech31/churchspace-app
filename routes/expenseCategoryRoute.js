const router = require('express').Router();
const _ = require("lodash");

const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
    createExpenseCategory, updateExpenseCategory,
    deleteExpenseCategory, getSingleExpenseCategory,
    getAllExpenseCategory, findExpenseCategoryById
} = require('../controllers/expenseCategoryController');
const upload = require("../middleware/upload");

router.post("/", verifyTokenAndAdmin, createExpenseCategory);
router.put("/:id", verifyTokenUser, updateExpenseCategory);
router.get("/find/:id", verifyTokenUser, getSingleExpenseCategory);
router.delete('/:id', verifyTokenUser, deleteExpenseCategory);
router.get("/findByUserId", verifyTokenUser, findExpenseCategoryById);
router.get("/", verifyTokenAndAdmin, getAllExpenseCategory);

module.exports = router
