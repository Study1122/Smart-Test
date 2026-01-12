const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId:{ type:mongoose.Schema.Types.ObjectId,ref: "User" },
  
  testId:{ type:mongoose.Schema.Types.ObjectId,ref: "Test" },
  
  score: Number,
  
  correct: Number,
  
  wrong: Number,
  
  accuracy: Number,
  
  rank: Number,
  
  percentile: Number,
});

module.exports = mongoose.model("Result", resultSchema);