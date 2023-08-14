const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    fname:String,
    lname:String,
    phone:String,
    level:Number,
    code:String,
});
const User = mongoose.model("User",userSchema);

module.exports = User;