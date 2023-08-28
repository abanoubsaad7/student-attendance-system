const express = require("express");
const app = express();
const port = 2000;

//session set up
const session = require("express-session");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//models
const User = require("./models/userSchema");
const Attendance = require("./models/attSchema");
const Pay = require("./models/paySchema");
const Exam = require("./models/examSchema");
//database set up
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://AbanoubSaad:dev@cluster0.yoqimye.mongodb.net/student_Attendance_System?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });

function loginMiddleware(req, res, next) {
  // Check if the user is logged in
  let verfiyLogIn = req.session.loggedIn;
  console.log('verfiyLogIn :>> ', verfiyLogIn);
  if (verfiyLogIn) {
    // User is logged in, proceed to the next middleware
    next();
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/');
  }
}

app.get("/", (req, res) => {
  res.render("index1");
});
//login page
app.post("/admin", function (req, res) {
 if (req.body.pass === '1234') {
    req.session.loggedIn = true; // Set the loggedIn property in session
    res.redirect('/index');
  } else {
    res.redirect('/');
  }
  app.post('/exit',(req,res)=>{
    req.session.loggedIn = false;
    res.redirect('/')
  })
});
app.get("/index",loginMiddleware, (req, res) => {
  res.render("index");
});

app.get("/add-student",loginMiddleware,(req, res) => {
  res.render("add-student");
});

app.post("/user", function (req, res) {
  const newuser = new User(req.body);

  newuser.save().then((result) => {
    res.redirect("/add-student");
  });
});

//attendance regist
app.get("/attendance",loginMiddleware, (req, res) => {
  res.render("att");
});

app.post("/attendance", async (req, res) => {
  const currentDate = new Date(); // Retrieve the current date
  const currentDay = currentDate.getDate(); // Get the current day
  const currentMonth = currentDate.getMonth(); // Get the current month
  const currentYear = currentDate.getFullYear(); // Get the current year

  const startOfDay = new Date(currentYear, currentMonth, currentDay);
  const endOfDay = new Date(currentYear, currentMonth, currentDay + 1);

  let studentAtt = await User.findOne({ code: req.body.code });
  console.log(studentAtt);
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
      res.redirect("/attendances");
    } else {
      // Attendance already recorded for this student
      res.send("Attendance already recorded for this student today.");
    }
  }
});

app.get("/attendances",loginMiddleware, async (req, res) => {
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
app.get("/report",loginMiddleware, (req, res) => {
  res.render("report");
});

app.post("/report", async (req, res) => {
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

app.get("/reports",loginMiddleware, async (req, res) => {
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

//update
app.get("/main-update",loginMiddleware, (req, res) => {
  res.render("main-update");
});
app.get("/all-update",loginMiddleware, (req, res) => {
  User.find().then((student) => {
    res.render("all-update", { arrstudent: student });
  });
});

app.get("/update-one",loginMiddleware, (req, res) => {
  User.find({ level: 1 }).then((student) => {
    res.render("one-update", { arrstudent: student });
  });
});

app.get("/update-two",loginMiddleware, (req, res) => {
  User.find({ level: 2 }).then((student) => {
    res.render("two-update", { arrstudent: student });
  });
});

app.get("/update-three",loginMiddleware, (req, res) => {
  User.find({ level: 3 }).then((student) => {
    res.render("three-update", { arrstudent: student });
  });
});

app.get("/update/:id",loginMiddleware, (req, res) => {
  User.findById(req.params.id)
    .then((result) => {
      console.log("student :>> ", result);
      res.render("update-form", { objstudent: result });
    })
    .catch((err) => {
      console.log("err :>> ", err);
    });
});

app.post("/update/:id", function (req, res) {
  User.findByIdAndUpdate(req.params.id, req.body).then((result) => {
    res.redirect("/main-update");
  });
});

//delete requests
app.get("/main-delete",loginMiddleware, (req, res) => {
  res.render("main-delete");
});

app.get("/all-delete",loginMiddleware, (req, res) => {
  User.find().then((student) => {
    res.render("all-delete", { arrstudent: student });
  });
});

app.get("/delete-one",loginMiddleware, (req, res) => {
  User.find({ level: 1 }).then((student) => {
    res.render("one-delete", { arrstudent: student });
  });
});

app.get("/delete-two",loginMiddleware, (req, res) => {
  User.find({ level: 2 }).then((student) => {
    res.render("two-delete", { arrstudent: student });
  });
});

app.get("/delete-three",loginMiddleware, (req, res) => {
  User.find({ level: 3 }).then((student) => {
    res.render("three-delete", { arrstudent: student });
  });
});

app.get("/delete/:id",loginMiddleware, (req, res) => {
  User.findById(req.params.id)
    .then((result) => {
      console.log("student :>> ", result);
      res.render("delete-confirm", { objStudent: result });
    })
    .catch((err) => {
      console.log("err :>> ", err);
    });
});

app.delete("/delete/:id",loginMiddleware, function (req, res) {
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

//student reports
app.get("/all-student-report",loginMiddleware, (req, res) => {
  User.find().then((allStudents) => {
    res.render("all-student-report", { arrstudent: allStudents });
  });
});

app.get("/all-student-report/:studentID",loginMiddleware, (req, res) => {
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

//Student Pay for month

app.get("/main-pay",loginMiddleware, (req, res) => {
  res.render("main-pay");
});

app.get("/pay",loginMiddleware, (req, res) => {
  res.render("pay");
});

app.post("/pay",loginMiddleware, async (req, res) => {
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

//pay report
app.get("/pay-report",loginMiddleware, (req, res) => {
  res.render("pay-report");
});

app.post("/pay-report", async (req, res) => {
  let selectedMonth = req.body.mon;

  let studentsPayBySelectedMonth = await Pay.find({ mon: selectedMonth });
  req.session.studentsPayBySelectedMonth = studentsPayBySelectedMonth;
  res.redirect("/pay-reports");
});

app.get("/pay-reports",loginMiddleware, async (req, res) => {
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

//exams
app.get("/main-exam",loginMiddleware, (req, res) => {
  res.render("main-exam");
});
app.get("/all-studentlist-for-exam",loginMiddleware, (req, res) => {
  User.find().then((students) => {
    res.render("studentList-Exam", { arrstudent: students });
  });
});

app.get("/exam-one",loginMiddleware, (req, res) => {
  User.find({ level: 1 }).then((student) => {
    res.render("one-exam", { arrstudent: student });
  });
});

app.get("/exam-two",loginMiddleware, (req, res) => {
  User.find({ level: 2 }).then((student) => {
    res.render("two-exam", { arrstudent: student });
  });
});

app.get("/exam-three",loginMiddleware, (req, res) => {
  User.find({ level: 3 }).then((student) => {
    res.render("three-exam", { arrstudent: student });
  });
});

app.get("/all-studentlist-for-exam/:studentID",loginMiddleware, (req, res) => {
  User.findById(req.params.studentID).then((student) => {
    res.render("add-exam", { objstudent: student });
  });
});

app.post("/all-studentlist-for-exam/:studentID", async (req, res) => {
  const newExam = new Exam({
    studentID: req.params.studentID,
    examName: req.body.examName,
    degree: req.body.degree,
  });
  newExam.save().then((studentExam) => {
    res.redirect("/main-exam");
  });
});
