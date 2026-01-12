const Attempt = require("./attempt.model");
const Test = require("../test/test.model");
const Result = require("../result/result.model");
const shuffle = require("../../utils/shuffleQuestions");
const calculateScore = require("../../utils/calculateScore");
const calculateRanks = require("../../utils/rankCalculator");

/**
 * 📄 START TEST
 */
exports.startTest = async (req, res) => {
  const { testId } = req.body;
  const userId = req.userId; // will come from auth later

  const test = await Test.findById(testId).populate("questions", "question options");
  if (!test) return res.status(404).json({ message: "Test not found" });
  
  /*####### Check premium ######*/
  /*
  
  
  
  if (!test.isFree) {
    const paid = await Payment.findOne({
      userId,
      testId,
      status: "paid",
    });
  
    if (!paid) {
      return res.status(403).json({
        message: "Please purchase this test",
      });
    }
  }
  */
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + test.duration * 60 * 1000
  );
  
  /* =============*/
  const alreadySubmitted = await Attempt.findOne({
    userId,
    testId,
    status: "submitted",
  });
  
  if (alreadySubmitted) {
    return res.status(400).json({
      message: "You have already attempted this test",
    });
  }

  /* =============*/
  const ongoingAttempt = await Attempt.findOne({
    userId,
    testId,
    status: "ongoing",
  });
  
  if (ongoingAttempt) {
    return res.json({
      attemptId: ongoingAttempt._id,
      expiresAt: ongoingAttempt.expiresAt,
      message: "Resuming previous attempt",
    });
  }

  const shuffledQuestions = shuffle(test.questions);

  const attempt = await Attempt.create({
    userId,
    testId,
    expiresAt,
    answers: shuffledQuestions.map(q => ({
      questionId: q._id,
      selectedOption: -1,
    })),
  });

  res.json({
    attemptId: attempt._id,
    duration: test.duration,
    expiresAt, // frontend can sync timer
    questions: shuffledQuestions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    })),
  });
};

/**
 * 📄 SAVE ANSWERS
 */
exports.saveAnswer = async (req, res) => {
  const { attemptId, questionId, selectedOption } = req.body;

  const attempt = await Attempt.findById(attemptId);
  if (!attempt || attempt.status !== "ongoing")
    return res.status(400).json({ message: "Invalid attempt" });
    
  if (new Date() > attempt.expiresAt) {
    attempt.status = "expired";
    await attempt.save();
    return res.status(403).json({
      message: "Time over. Test expired",
    });
  }

  const answer = attempt.answers.find(
    a => a.questionId.toString() === questionId
  );

  if (answer) {
    answer.selectedOption = selectedOption;
  }

  await attempt.save();
  res.json({ success: true });
};

/**
 * 📄 RESULT
 */
exports.submitTest = async (req, res) => {
  const { attemptId } = req.body;

  const attempt = await Attempt.findById(attemptId);
  if (!attempt || attempt.status !== "ongoing")
    return res.status(400).json({ message: "Invalid attempt" });
    
  if (new Date() > attempt.expiresAt) {
    attempt.status = "expired";
    attempt.submittedAt = new Date();
    await attempt.save();

    return res.status(403).json({
      message: "Time over. Test auto-expired",
    });
  }

  const test = await Test.findById(attempt.testId);

  const resultData = await calculateScore(attempt, test);

  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  await attempt.save();
  /*##############===========##############*/
  const existingResult = await Result.findOne({
    userId: attempt.userId,
    testId: attempt.testId,
  });
  
  if (existingResult) {
    return res.status(400).json({
      message: "Test already submitted",
    });
  }

  const result = await Result.create({
    userId: attempt.userId,
    testId: attempt.testId,
    ...resultData,
  });
  
  // 🔥 RANK CALCULATION TRIGGER
  //⚠️ Later we’ll move this to cron / test-end hook for large scale.
  await calculateRanks(attempt.testId);

  res.json({
    message: "Test submitted",
    result,
  });
};