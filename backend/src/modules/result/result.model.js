const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId:{ type:mongoose.Schema.Types.ObjectId,ref: "User" },
  
  testId:{ type:mongoose.Schema.Types.ObjectId,ref: "Test" },
  
  score: Number,
  
  correct: Number,
  
  wrong: Number,
  
  accuracy: Number,
  
  attempted: Number,
  
  notAnswered: {
    type: Number,
    default: 0,
  },
  
  rank: Number,
  
  percentile: Number,
});

resultSchema.index({ userId: 1, testId: 1 }, { unique: true });



module.exports = mongoose.model("Result", resultSchema);