const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paySchema = new Schema({
  studentID: mongoose.Types.ObjectId,
  mon: String,
  isPay: {
    type:Boolean,
    default : false
  }
});

const Pay = mongoose.model("Pay",paySchema);

module.exports = Pay;