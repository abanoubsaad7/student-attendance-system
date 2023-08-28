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

//Student Pay for month

router.get("/main-pay",  (req, res) => {
  res.render("main-pay");
});

router.get("/pay",  (req, res) => {
  res.render("pay");
});

router.post("/pay",  async (req, res) => {
  let studentPay = await User.findOne({ code: req.body.code });
  if (studentPay) {
    const payed = new Pay({
      studentID: studentPay._id,
      mon: req.body.mon,
      isPay: true,
    });
    payed.save().then((result) => {
      res.redirect("/pay");
    });
  }
});
module.exports=router;