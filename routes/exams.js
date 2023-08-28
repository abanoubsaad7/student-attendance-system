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


//exams
router.get("/main-exam",  (req, res) => {
  res.render("main-exam");
});
router.get("/all-studentlist-for-exam",  (req, res) => {
  User.find().then((students) => {
    res.render("studentList-Exam", { arrstudent: students });
  });
});

router.get("/exam-one",  (req, res) => {
  User.find({ level: 1 }).then((student) => {
    res.render("one-exam", { arrstudent: student });
  });
});

router.get("/exam-two",  (req, res) => {
  User.find({ level: 2 }).then((student) => {
    res.render("two-exam", { arrstudent: student });
  });
});

router.get("/exam-three",  (req, res) => {
  User.find({ level: 3 }).then((student) => {
    res.render("three-exam", { arrstudent: student });
  });
});

router.get("/all-studentlist-for-exam/:studentID",  (req, res) => {
  User.findById(req.params.studentID).then((student) => {
    res.render("add-exam", { objstudent: student });
  });
});

router.post("/all-studentlist-for-exam/:studentID", async (req, res) => {
  const newExam = new Exam({
    studentID: req.params.studentID,
    examName: req.body.examName,
    degree: req.body.degree,
  });
  newExam.save().then((studentExam) => {
    res.redirect("/main-exam");
  });
});

module.exports= router;