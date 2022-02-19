const router = require('express').Router();

var excelReader = require('../helper/excel-reader');
var mongoose = require('mongoose');
var Employee = require('../models/employeeModel');

/* GET users listing. */
router.get('/', function (req, res, next) {
  var employeesJsonArray = excelReader.readExcel('./public/employees.xlsx')
  Employee.insertMany(employeesJsonArray, function (error, docs) {
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
});
module.exports = router;