const router = require('express').Router();
const path = require('path');
const __basedir = path.resolve();
const Member = require("../models/memberModel");
const upload = require("../middleware/upload");
const readXlsxFile = require("read-excel-file/node");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenUser } = require("../verifyToken");
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }
    let path =
      __basedir + "/uploads/" + req.file.filename;
    readXlsxFile(path).then((rows) => {
      // skip header
      rows.shift();
      let tutorials = [];
      rows.forEach((row) => {
        let tutorial = {
          first_name: row[0],
          last_name: row[1],
          email: row[2],
          mobile: row[3],
          alternative_mobile: row[4],
          home_address: row[5],
          office_address: row[6],
        };
        tutorials.push(tutorial);
      });
      Member.create(tutorials)
        .then(() => {
          res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Fail to import data into database!",
            error: error.message,
          });
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
});

module.exports = router
