const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  subject: String,
  question: String,
  options: [String],
  correctAnswer: Number,
  explanation: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
});

module.exports = mongoose.model("Question", questionSchema);