const express = require('express')
const app = express()
const port = 2000

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
    res.render('index.ejs')
  })

  app.post('/user', function (req, res) {
    const newuser = new User(req.body);

    newuser.save()
    .then((result)=>{
      res.json(result)
    })
  })

  app.get('/attendance', (req, res) => {
    res.render('att.ejs')
  })

  app.post('/attendance', async (req, res) => {
    let studentAtt = await User.findOne({code:req.body.code});
    console.log(studentAtt)
    if(studentAtt){
      const attendanceRecord = new Attendance({ userID:studentAtt._id });
        attendanceRecord.save()
        .then((result)=>{
          res.json(result)
          console.log('result :>> ', result);
        })

    }
  })