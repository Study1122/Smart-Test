const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Exam",
    require: true
  },
  
  title: String,
  
  duration: Number, // minutes
  
  questions: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Question" 
    }
  ],
  
  marking: {
    correct: { type: Number, default: 1 },
    negative: { type: Number, default: 0.25 },
  },
  
  isFree: Boolean,
  price: Number,
});

module.exports = mongoose.model("Test", testSchema);