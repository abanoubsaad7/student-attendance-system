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
  })
);
// Middleware to parse JSON request bodies
router.use(express.json());
//attendance regist
router.get("/attendance", (req, res) => {
  res.render("att");
});

router.post("/attendance", async (req, res) => {
  const currentDate = new Date(); // Retrieve the current date
  const currentDay = currentDate.getDate(); // Get the current day
  const currentMonth = currentDate.getMonth(); // Get the current month
  const currentYear = currentDate.getFullYear(); // Get the current year

  const startOfDay = new Date(currentYear, currentMonth, currentDay);
  const endOfDay = new Date(currentYear, currentMonth, currentDay + 1);
console.log('req.body.code before :>> ', req.body.code);
  let studentAtt = await User.findOne({ code: req.body.code });
  console.log('req.body.code after :>> ', req.body.code);
  console.log('studentAtt >>',studentAtt);
  if (studentAtt) {
    // Check if the student's attendance for today already exists
    const existingAttendance = await Attendance.findOne({
      userID: studentAtt._id,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    if (!existingAttendance) {
      const attendanceRecord = new Attendance({ userID: studentAtt._id });
      await attendanceRecord.save();
      req.session.studentAtt = studentAtt;
      res.json({ redirectTo: '/attendances' });
    }else {
      // Attendance already recorded for this student
      res.json({ message: "تم التسجيل من قبل" });
    }
  }else{
    res.json({ message: " لا يوجد طالب بهذا الكود " });
  }
});

router.get("/attendances", async (req, res) => {
  const currentDate = new Date(); // Retrieve the current date
  const currentDay = currentDate.getDate(); // Get the current day
  const currentMonth = currentDate.getMonth(); // Get the current month
  const currentYear = currentDate.getFullYear(); // Get the current year

  const startOfDay = new Date(currentYear, currentMonth, currentDay);
  const endOfDay = new Date(currentYear, currentMonth, currentDay + 1);

  const studentAtt = req.session.studentAtt;

  // Find attendance records that fall within the current day
  const attendance = await Attendance.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });
  let studentList = [];
  let attDate = [];
  for (let i = 0; i < attendance.length; i++) {
    let studentWasRigst = await User.findOne({
      _id: attendance[i].userID,
      level: studentAtt.level,
      groupType: studentAtt.groupType,
      dayOne: studentAtt.dayOne,
      dayTwo: studentAtt.dayTwo,
      startHour: studentAtt.startHour,
      endHour: studentAtt.endHour,
      place: studentAtt.place,
    });
    if (studentWasRigst) {
      studentList.push(studentWasRigst);
      // Convert the date property to a Date object
      const date = new Date(attendance[i].date);
      // Add 1 hour to the date
      date.setHours(date.getHours() + 2);
      // Format the date as dd/mm/yyyy
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString();

      const formattedDate = `${year}/${month}/${day}`;

      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      const formattedDateTime = `${formattedDate}   ${formattedTime}`;
      attDate.push(formattedDateTime);
    }
  }
  console.log("studentList :>> ", studentList);
  res.render("atts", { objstudent: studentList, arrAttDate: attDate });
});


//attendance reports
router.get("/report", (req, res) => {
  res.render("report");
});

router.post("/report", async (req, res) => {
  let selectedDate = new Date(req.body.day);
  let selectedDay = selectedDate.getDate();
  let selectedMonth = selectedDate.getMonth();
  let selectedYear = selectedDate.getFullYear();

  const startOfDay = new Date(selectedYear, selectedMonth, selectedDay);
  const endOfDay = new Date(selectedYear, selectedMonth, selectedDay + 1);

  let attendance = await Attendance.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });
  // Adjust the time by adding 2 hours to each attendance record
  // attendance.forEach(record => {
  //   record.date.setHours(record.date.getHours() + 2);
  // });

  console.log("attendance :>> ", attendance);
  req.session.attendance = attendance; // Store the attendance data in the session
  res.redirect("/reports");
});

router.get("/reports", async (req, res) => {
  const attendance = req.session.attendance; // Retrieve the attendance data from the session
  let studentList = [];
  let attDate = [];
  for (let i = 0; i < attendance.length; i++) {
    let studentWasRigst = await User.findById(attendance[i].userID);
    studentList.push(studentWasRigst);
    // Convert the date property to a Date object
    const date = new Date(attendance[i].date);

    // Add 1 hour to the date
    date.setHours(date.getHours() + 2);
    // Format the date as dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    const formattedDate = `${year}/${month}/${day}`;

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const formattedDateTime = `${formattedDate}   ${formattedTime}`;
    attDate.push(formattedDateTime);
  }
  console.log("studentList :>> ", studentList);
  console.log("attDate :>> ", attDate);

  res.render("reports", { arrstudent: studentList, arrAttDate: attDate });
});


module.exports = router