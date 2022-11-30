const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please enter Branch name"] },
  longitude: { type: String, required: [true, "Please enter longitude"] },
  latitude: { type: String, required: [true, "Please enter latitude"] },
  radius: { type: String, required: [true, "Please enter radius"] },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "Company",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Branch", BranchSchema);
