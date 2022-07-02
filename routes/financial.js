const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
    createOffering, createTithe,
    createExpenses, updateFinancial,
    deleteFinancial, getSingleFinancial,
    getAllFinancial, findFinancialById,
    getFinancialStats, getFinancialAggregationStats
} = require('../controllers/financial');

router.post("/offering", verifyTokenUser, createOffering);
router.post("/tithe", verifyTokenUser, createTithe);
router.post("/expenses", verifyTokenUser, createExpenses);
router.put("/:id", verifyTokenUser, updateFinancial);
router.get("/find/:id", verifyTokenUser, getSingleFinancial);
router.delete('/:id', verifyTokenUser, deleteFinancial);
router.get("/stats", verifyTokenUser, getFinancialStats);
router.get("/statsagg", verifyTokenUser, getFinancialAggregationStats);
router.get("/findByUserId", verifyTokenUser, findFinancialById);
router.get("/", verifyTokenAndAdmin, getAllFinancial);

module.exports = router
