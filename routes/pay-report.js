const express = require('express')
const router = express.Router()
//models
const User = require("../models/userSchema");
const Attendance = require("../models/attSchema");
const Pay = require("../models/paySchema");
const Exam = require("../models/examSchema");


//session set up
const session = require("express-session");

router.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  }))


//pay report
router.get("/pay-report", (req, res) => {
  res.render("pay-report");
});

router.post("/pay-report", async (req, res) => {
  let selectedMonth = req.body.mon;

  let studentsPayBySelectedMonth = await Pay.find({ mon: selectedMonth });
  req.session.studentsPayBySelectedMonth = studentsPayBySelectedMonth;
  res.redirect("/pay-reports");
});

router.get("/pay-reports", async (req, res) => {
  const studentsPayBySelectedMonth = req.session.studentsPayBySelectedMonth;
  let studentList = [];
  for (let i = 0; i < studentsPayBySelectedMonth.length; i++) {
    let studentWasPayed = await User.findById(
      studentsPayBySelectedMonth[i].studentID
    );
    studentList.push(studentWasPayed);
  }

  console.log("studentList :>> ", studentList);
  console.log("studentsPayBySelectedMonth :>> ", studentsPayBySelectedMonth);
  res.render("pay-reports", {
    arrstudent: studentList,
    payList: studentsPayBySelectedMonth,
  });
});

module.exports = router
