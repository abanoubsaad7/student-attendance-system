const express = require('express')
const router = express.Router()
//models
const User = require("../models/userSchema");
const Attendance = require("../models/attSchema");
const Pay = require("../models/paySchema");
const Exam = require("../models/examSchema");


//student reports
router.get("/all-student-report", (req, res) => {
  User.find().then((allStudents) => {
    res.render("all-student-report", { arrstudent: allStudents });
  });
});

router.get("/all-student-report/:studentID", (req, res) => {
  let studentID = req.params.studentID;
  User.findById(studentID)
    .then((student) => {
      Attendance.find({ userID: studentID })
        .then((allAttendance) => {
          Exam.find({ studentID: studentID })
            .then((allExams) => {
              let allAttendanceDate = [];
              for (let i = 0; i < allAttendance.length; i++) {
                // Convert the date property to a Date object
                const date = new Date(allAttendance[i].date);

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
                allAttendanceDate.push(formattedDateTime);
              }
              console.log('allAttendanceDate :>> ', allAttendanceDate);
              res.render("student-report", {
                objstudent: student,
                arrAllAttendance: allAttendanceDate,
                arrAllExams: allExams,
              });
            })
            .catch((examError) => {
              console.error("Error retrieving exams:", examError);
              res.render("student-report", {
                objstudent: student,
                arrAllAttendance: allAttendanceDate,
                arrAllExams: [],
              });
            });
        })
        .catch((attendanceError) => {
          console.error("Error retrieving attendance:", attendanceError);
          res.render("student-report", {
            objstudent: student,
            arrAllAttendance: [],
            arrAllExams: [],
          });
        });
    })
    .catch((studentError) => {
      console.error("Error retrieving student:", studentError);
      res.render("student-report", {
        objstudent: null,
        arrAllAttendance: [],
        arrAllExams: [],
      });
    });
});


module.exports = router
