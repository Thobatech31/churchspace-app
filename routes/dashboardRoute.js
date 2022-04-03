const router = require('express').Router();
const { each } = require('lodash');
const Financial = require("../models/financialModel");
const Attendance = require("../models/attendanceModel");
const Group = require("../models/churchGroupModel");
const Counselling = require("../models/counsellingModel");
const Department = require("../models/departmentModel");
const FirstTimer = require("../models/firstTimerModel");
const Member = require("../models/memberModel");
const Minister = require("../models/ministerModel");
const PrayerRequest = require("../models/prayerRequestModel");

const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");

//Get Dasboard Stats
router.get("/stats", verifyTokenUser, async (req, res, next) => {
  //Initiating a seach parameter with (Financials)
  const user = req.user;
  try {
    const Financials = await Financial.find({ userId: user.id }) //we use FIND because user can have more than one order
    // count the total number of return recods
    const totalFinancials = Financials.length;

    const Attendances = await Attendance.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalAttendances = Attendances.length;

    const ChurchGroups = await Group.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalChurchGroups = ChurchGroups.length;

    const counsellings = await Counselling.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalCounsellings = counsellings.length;

    const departments = await Department.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalDepartments = departments.length;

    const firstTimers = await FirstTimer.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalFirstTimers = firstTimers.length;

    const members = await Member.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalMembers = members.length;

    const ministers = await Minister.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalMinisters = ministers.length;

    const prayerRequests = await PrayerRequest.find({ userId: user.id }) //we use FIND because user can have more than one order
    const totalPrayerRequests = prayerRequests.length;


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
      data:{
        total_financials: totalFinancials,
        total_attendances: totalAttendances,
        total_Church_Groups: totalChurchGroups,
        total_counsellings: totalCounsellings,
        total_departments: totalDepartments,
        total_firstTimers: totalFirstTimers,
        total_members: totalMembers,
        total_ministers: totalMinisters,
        total_prayer_requests: totalPrayerRequests,
        total_income: totalIncome,
        total_income_tithe: totalIncomeTithe,
        total_income_offering: totalIncomeOffering,
        total_expense: totalExpense
      }
    })


  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})


module.exports = router
