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
const Pay = require('./models/paySchema');
const Exam = require('./models/examSchema');
//database set up
const mongoose = require("mongoose");





mongoose
  .connect(
    "mongodb+srv://AbanoubSaad:dev@cluster0.yoqimye.mongodb.net/student_Attendance_System?retryWrites=true&w=majority")
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });

  app.get('/', (req, res) => {
    res.render('index1')
  })
  //login page
  app.post('/admin', function (req, res) {
    if (req.body.pass ==='1234'){
      res.redirect('/index')
    }
  })
  app.get('/index', (req, res) => {
    res.render('index')
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
    const currentDate = new Date(); // Retrieve the current date
    const currentDay = currentDate.getDate(); // Get the current day
    const currentMonth = currentDate.getMonth(); // Get the current month
    const currentYear = currentDate.getFullYear(); // Get the current year
  
    const startOfDay = new Date(currentYear, currentMonth, currentDay);
    const endOfDay = new Date(currentYear, currentMonth, currentDay + 1);

    let studentAtt = await User.findOne({code:req.body.code});
    console.log(studentAtt)
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
        res.redirect('/attendances');
      } else {
        // Attendance already recorded for this student
        res.send('Attendance already recorded for this student today.');
      }
    }
  })

  app.get('/attendances', async(req, res) => {
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
    let studentList = []
    let attDate =[]
    for (let i=0  ; i<attendance.length; i++){
      let studentWasRigst = await User.findOne({
        _id:attendance[i].userID,
        level:studentAtt.level,
        groupType:studentAtt.groupType,
        dayOne:studentAtt.dayOne,
        dayTwo:studentAtt.dayTwo,
        startHour:studentAtt.startHour,
        endHour:studentAtt.endHour,
        place:studentAtt.place
      })
      if (studentWasRigst){
        studentList.push(studentWasRigst)
        attDate.push(attendance[i].date)
      }
    }
    attDate.forEach(record => {
      record.setHours(record.getHours() + 2);
    });
    console.log('studentList :>> ', studentList);
    res.render('atts',{objstudent:studentList,arrAttDate:attDate})
  })

  //attendance reports
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
      // Adjust the time by adding 2 hours to each attendance record
  attendance.forEach(record => {
    record.date.setHours(record.date.getHours() + 2);
  });
  
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

  //update
  app.get('/main-update', (req, res) => {
    res.render('main-update')
  })
  app.get('/all-update', (req, res) => {
    User.find().then((student)=>{
      res.render('all-update',{arrstudent:student})
    })
  })

  app.get('/update-one', (req, res) => {
    User.find({level:1}).then((student)=>{
      res.render('one-update',{arrstudent:student})
    })
  })

app.get('/update-two', (req, res) => {
  User.find({level:2}).then((student)=>{
    res.render('two-update',{arrstudent:student})
  })
})

app.get('/update-three', (req, res) => {
  User.find({level:3}).then((student)=>{
    res.render('three-update',{arrstudent:student})
  })
})

  app.get('/update/:id', (req, res) => {
    User.findById(req.params.id).then((result)=>{
      console.log('student :>> ', result);
      res.render('update-form',{objstudent:result})
    })
    .catch((err)=>{
      console.log('err :>> ', err);
    })
  })

  app.post('/update/:id', function (req, res) {
    User.findByIdAndUpdate(req.params.id,req.body).then((result)=>{
      res.redirect('/main-update')
    })
  })

  //delete requests
  app.get('/main-delete',(req,res)=>{
    res.render("main-delete")
  })

  app.get('/all-delete', (req, res) => {
    User.find().then((student)=>{
      res.render('all-delete',{arrstudent:student});
    })
  })

  app.get('/delete-one', (req, res) => {
    User.find({level: 1 }).then ((student)=> {
      res.render ('one-delete' , { arrstudent: student });
    })
  })

  app.get('/delete-two', (req, res) => {
    User.find({level: 2 }).then ((student)=> {
      res.render ('two-delete' , { arrstudent: student });
    })
  })

  app.get('/delete-three', (req, res) => {
    User.find({level: 3 }).then ((student)=> {
      res.render ('three-delete' , { arrstudent: student });
    })
  })


  app.get('/delete/:id', (req, res) => {
    User.findById(req.params.id).then((result)=>{
      console.log('student :>> ', result);
      res.render('delete-confirm',{objStudent:result})
    })
    .catch((err)=>{
      console.log('err :>> ', err);
    })
  })

  app.delete('/delete/:id', function(req, res) {
    let studentID = req.params.id;
    User.findByIdAndDelete(studentID).then((student)=>{
      Attendance.deleteMany({userID:studentID}).then((result)=>{
         Pay.deleteMany({studentID:studentID}).then((payed)=>{
   Exam.deleteMany({studentID:studentID}).then((exams)=>{
res.json({ myLink: "/main-delete" })
})
})
        
      })
    })
  });

  //student reports
  app.get('/all-student-report', (req, res) => {
    User.find().then((allStudents)=>{
      res.render('all-student-report',{arrstudent:allStudents})
    })
  })

  app.get('/all-student-report/:studentID', (req, res) => {
    let studentID = req.params.studentID;
    User.findById(studentID)
      .then((student) => {
        Attendance.find({ userID: studentID })
          .then((allAttendance) => {
            Exam.find({ studentID: studentID })
              .then((allExams) => {
                res.render('student-report', {
                  objstudent: student,
                  arrAllAttendance: allAttendance,
                  arrAllExams: allExams,
                });
              })
              .catch((examError) => {
                console.error('Error retrieving exams:', examError);
                res.render('student-report', {
                  objstudent: student,
                  arrAllAttendance: allAttendance,
                  arrAllExams: [],
                });
              });
          })
          .catch((attendanceError) => {
            console.error('Error retrieving attendance:', attendanceError);
            res.render('student-report', {
              objstudent: student,
              arrAllAttendance: [],
              arrAllExams: [],
            });
          });
      })
      .catch((studentError) => {
        console.error('Error retrieving student:', studentError);
        res.render('student-report', {
          objstudent: null,
          arrAllAttendance: [],
          arrAllExams: [],
        });
      });
  });

  //Student Pay for month

  app.get('/main-pay', (req, res) => {
    res.render('main-pay')
  })

  app.get('/pay', (req, res) => {
    res.render("pay");
  })

  app.post('/pay', async (req, res)=> {
    let studentPay = await User.findOne({code:req.body.code});
    if(studentPay){
      const payed = new Pay({
        studentID:studentPay._id,
        mon:req.body.mon,
        isPay: true
      })
      payed.save().then((result)=>{
        res.redirect("/pay")
      })
    }
  })

  //pay report
  app.get('/pay-report', (req, res) => {
    res.render('pay-report')
  })

  app.post('/pay-report', async(req, res) => {
    let selectedMonth = req.body.mon;

    let studentsPayBySelectedMonth = await Pay.find({mon:selectedMonth})
    req.session.studentsPayBySelectedMonth = studentsPayBySelectedMonth;
    res.redirect('/pay-reports')
  })

  app.get('/pay-reports', async(req, res) => {
    const studentsPayBySelectedMonth = req.session.studentsPayBySelectedMonth
    let studentList = []
    for(let i=0; i<studentsPayBySelectedMonth.length; i++){
      let studentWasPayed = await User.findById(studentsPayBySelectedMonth[i].studentID);
      studentList.push(studentWasPayed)
      
    }
    
    console.log('studentList :>> ', studentList);
    console.log('studentsPayBySelectedMonth :>> ', studentsPayBySelectedMonth);
    res.render('pay-reports' ,{arrstudent:studentList,payList:studentsPayBySelectedMonth} )
  })

  //exams
  app.get('/main-exam', (req, res) => {
    res.render('main-exam')
  })
  app.get('/all-studentlist-for-exam', (req, res) => {
    User.find().then((students)=>{
      res.render('studentList-Exam', {arrstudent:students });
    })
  })

  app.get('/exam-one', (req, res) => {
    User.find({level: 1 }).then ((student)=> {
      res.render ('one-exam' , { arrstudent: student });
    })
  })

  app.get('/exam-two', (req, res) => {
    User.find({level: 2 }).then ((student)=> {
      res.render ('two-exam' , { arrstudent: student });
    })
  })

  app.get('/exam-three', (req, res) => {
    User.find({level: 3 }).then ((student)=> {
      res.render ('three-exam' , { arrstudent: student });
    })
  })


  app.get('/all-studentlist-for-exam/:studentID', (req, res) => {
    User.findById(req.params.studentID).then((student)=>{
      res.render('add-exam',{objstudent:student})
    })
  })

  app.post('/all-studentlist-for-exam/:studentID', async (req, res) => {
    const newExam = new Exam({
      studentID:req.params.studentID,
      examName:req.body.examName,
      degree:req.body.degree
    })
    newExam.save().then((studentExam)=>{
      res.redirect('/main-exam')
    })
  })