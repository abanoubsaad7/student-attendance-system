const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  userID: mongoose.Types.ObjectId,
  date: { type: Date, default: moment().tz("Africa/Cairo").format("YYYY-MM-DD hh:mm A") }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;