
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const options = {
  timeZone: 'Africa/Cairo',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true
};

const attendanceSchema = new Schema({
  userID: mongoose.Types.ObjectId,
  date: { type: Date, default: Date.now }
});

attendanceSchema.pre("save", function (next) {
  // Convert the date to Cairo time zone
  const cairoDate = new Date(this.date.toLocaleString('en-US', options));
  this.date = cairoDate;

  // Increment the hours by 1
  this.date.setHours(this.date.getHours() + 1);
  next();
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
