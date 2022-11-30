const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please enter Company name"] },
  color: { type: String },
  logo: { type: String },
  address: { type: String },
  branch: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Company", CompanySchema);
