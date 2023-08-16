const mongoose = require("mongoose");
const { schema } = require("./userSchema");
const Schema = mongoose.Schema;

const examSchema = new Schema({
  studentID:mongoose.Types.ObjectId,
  examName: String,
  degree:Number
})

const Exam = mongoose.model('Exam',examSchema);

module.exports = Exam;