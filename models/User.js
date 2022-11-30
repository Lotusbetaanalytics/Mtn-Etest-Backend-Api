const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please add Firstname"],
  },
  lastname: {
    type: String,
    required: [true, "Please add Lastname"],
  },
  email: {
    type: String,
    required: [true, "Please add Email"],
    unique: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "Company",
    required: true,
  },
  role: {
    type: String,
    enum: ["SuperAdmin", "Admin"],
    default: "Admin",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
//Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
