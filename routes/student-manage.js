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


router.get("/add-student", (req, res) => {
  res.render("add-student");
});

router.post("/user", function (req, res) {
  const newuser = new User(req.body);

  newuser.save().then((result) => {
    res.redirect("/add-student");
  });
});

//update
router.get("/main-update",  (req, res) => {
  res.render("main-update");
});
router.get("/all-update",  (req, res) => {
  User.find().then((student) => {
    res.render("all-update", { arrstudent: student });
  });
});

router.get("/update-one",  (req, res) => {
  User.find({ level: 1 }).then((student) => {
    res.render("one-update", { arrstudent: student });
  });
});

router.get("/update-two",  (req, res) => {
  User.find({ level: 2 }).then((student) => {
    res.render("two-update", { arrstudent: student });
  });
});

router.get("/update-three",  (req, res) => {
  User.find({ level: 3 }).then((student) => {
    res.render("three-update", { arrstudent: student });
  });
});

router.get("/update/:id",  (req, res) => {
  User.findById(req.params.id)
    .then((result) => {
      console.log("student :>> ", result);
      res.render("update-form", { objstudent: result });
    })
    .catch((err) => {
      console.log("err :>> ", err);
    });
});

router.post("/update/:id", function (req, res) {
  User.findByIdAndUpdate(req.params.id, req.body).then((result) => {
    res.redirect("/main-update");
  });
});

//delete requests
router.get("/main-delete",  (req, res) => {
  res.render("main-delete");
});

router.get("/all-delete",  (req, res) => {
  User.find().then((student) => {
    res.render("all-delete", { arrstudent: student });
  });
});

router.get("/delete-one",  (req, res) => {
  User.find({ level: 1 }).then((student) => {
    res.render("one-delete", { arrstudent: student });
  });
});

router.get("/delete-two",  (req, res) => {
  User.find({ level: 2 }).then((student) => {
    res.render("two-delete", { arrstudent: student });
  });
});

router.get("/delete-three",  (req, res) => {
  User.find({ level: 3 }).then((student) => {
    res.render("three-delete", { arrstudent: student });
  });
});

router.get("/delete/:id",  (req, res) => {
  User.findById(req.params.id)
    .then((result) => {
      console.log("student :>> ", result);
      res.render("delete-confirm", { objStudent: result });
    })
    .catch((err) => {
      console.log("err :>> ", err);
    });
});

router.delete("/delete/:id",  function (req, res) {
  let studentID = req.params.id;
  User.findByIdAndDelete(studentID).then((student) => {
    Attendance.deleteMany({ userID: studentID }).then((result) => {
      Pay.deleteMany({ studentID: studentID }).then((payed) => {
        Exam.deleteMany({ studentID: studentID }).then((exams) => {
          res.json({ myLink: "/main-delete" });
        });
      });
    });
  });
});

module.exports = router;