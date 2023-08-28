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


//routes
const attendanceManageRoutes = require('./routes/attendance-manage')
const studentReportRoutes = require('./routes/student-report')
const payReportRoutes = require('./routes/pay-report')
const studentManage = require('./routes/student-manage')
const payManage = require('./routes/pay-manage')
const exams =require('./routes/exams')
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


app.use(studentManage,loginMiddleware)


app.use(attendanceManageRoutes,loginMiddleware)


app.use(studentReportRoutes,loginMiddleware)

app.use(payManage,loginMiddleware)

app.use(payReportRoutes,loginMiddleware)

app.use(exams,loginMiddleware)
