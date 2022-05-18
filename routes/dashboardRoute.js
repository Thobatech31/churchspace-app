const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {getDashboardStats} = require('../controllers/dashboardController');

router.get("/stats", verifyTokenUser, getDashboardStats);

module.exports = router
