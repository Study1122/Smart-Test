const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
  testId: 
    { type: mongoose.Schema.Types.ObjectId, 
      ref: "Test",
      require: true
    },
  answers: [
    { 
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
        
      selectedOption: Number,
    }
  ],
    
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // 🔥 NEW
  submittedAt: Date,
  
  status: { 
    type: String, 
    enum: ["ongoing", "submitted", "expired"],
    required: "true"
  },
});

attemptSchema.index(
  { userId: 1, testId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
