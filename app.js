const express = require('express')
const app = express()
const port = 2000

//session set up
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//models
const User = require('./models/userSchema');
const Attendance = require('./models/attSchema');
//database set up
const mongoose = require("mongoose");



mongoose
  .connect(
    "mongodb+srv://AbanoubSaad:dev@cluster0.yoqimye.mongodb.net/student_Attendance_System?retryWrites=true&w=majority"
  ,{
    useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 5000 // Increase the timeout value (in milliseconds)
  })
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });

  app.get('/', (req, res) => {
    res.render('index')
  })
  app.get('/index', (req, res) => {
    res.redirect('/')
  })

  app.get('/add-student', (req, res) => {
    res.render('add-student')
  })

  app.post('/user', function (req, res) {
    const newuser = new User(req.body);

    newuser.save()
    .then((result)=>{
      res.redirect('/add-student')
    })
  })

  //attendance regist
  app.get('/attendance', (req, res) => {
    res.render('att')
  })

  app.post('/attendance', async (req, res) => {
    let studentAtt = await User.findOne({code:req.body.code});
    console.log(studentAtt)
    if(studentAtt){
      const attendanceRecord = new Attendance({ userID:studentAtt._id });
        attendanceRecord.save()
        .then((result)=>{
          // res.json(result)
          console.log('result :>> ', result);
          res.redirect('/attendances')
        })

    }
  })

  app.get('/attendances', async(req, res) => {
    const currentDate = new Date(); // Retrieve the current date
    const currentDay = currentDate.getDate(); // Get the current day
    const currentMonth = currentDate.getMonth(); // Get the current month
    const currentYear = currentDate.getFullYear(); // Get the current year
  
    const startOfDay = new Date(currentYear, currentMonth, currentDay);
    const endOfDay = new Date(currentYear, currentMonth, currentDay + 1);

    // Find attendance records that fall within the current day
    const attendance = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });
    let studentList = []
    let attDate =[]
    for (let i=0  ; i<attendance.length; i++){
      let studentWasRigst = await User.findById(attendance[i].userID)
      studentList.push(studentWasRigst)
      attDate.push(attendance[i].date)
    }
    console.log('studentList :>> ', studentList);
    res.render('atts',{arrstudent:studentList,arrAttDate:attDate})
  })

  // reports
  app.get('/report', (req, res) => {
    res.render('report')
  })

  app.post('/report', async (req, res)=> {
    let selectedDate = new Date(req.body.day)
    let selectedDay =selectedDate.getDate();
    let selectedMonth = selectedDate.getMonth();
    let selectedYear = selectedDate.getFullYear();

    const startOfDay = new Date(selectedYear, selectedMonth, selectedDay);
    const endOfDay = new Date(selectedYear, selectedMonth, selectedDay + 1);

    let attendance = await Attendance.find({date:{
      $gte:startOfDay,
      $lt:endOfDay
    }})
    console.log('attendance :>> ', attendance);
    req.session.attendance = attendance; // Store the attendance data in the session
    res.redirect('/reports')
  })

  app.get('/reports', async(req, res) => {
    const attendance = req.session.attendance; // Retrieve the attendance data from the session
    let studentList = []
    let attDate =[]
    for (let i=0  ; i<attendance.length; i++){
      let studentWasRigst = await User.findById(attendance[i].userID)
      studentList.push(studentWasRigst)
      attDate.push(attendance[i].date)
    }
    console.log('studentList :>> ', studentList);
    console.log('attDate :>> ', attDate);
    res.render('reports',{arrstudent:studentList,arrAttDate:attDate})
  })

  app.get('/main-update', (req, res) => {
    res.render('main-update')
  })