const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  userID: mongoose.Types.ObjectId,
  date: { type: Date, default: Date.now }
});

const Attendance = mongoose.model("Attendance",attendanceSchema);

module.exports = Attendance;