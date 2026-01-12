const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: String, // SSC CGL
  category: String, // SSC / Bank / UPSC
  year: Number,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Exam", examSchema);