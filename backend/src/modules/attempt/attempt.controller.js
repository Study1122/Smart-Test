const Attempt = require("./attempt.model");
const Test = require("../test/test.model");
const Result = require("../result/result.model");
const shuffle = require("../../utils/shuffleQuestions");
const calculateScore = require("../../utils/calculateScore");
const calculateRanks = require("../../utils/rankCalculator");



/**
 * 📄 START TEST (SECTION-AWARE)
 */
exports.startTest = async (req, res) => {
  const { testId } = req.body;
  const userId = req.userId;

  const test = await Test.findById(testId)
    .populate("questions", "question options")
    .populate("sections.questions", "question options");

  if (!test) {
    return res.status(404).json({ message: "Test not found" });
  }

  // 🔑 Build unified question list
  let allQuestions = [];

  if (Array.isArray(test.sections) && test.sections.length > 0) {
    allQuestions = test.sections.flatMap(section =>
      section.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        section: section.name,
      }))
    );
  } else {
    allQuestions = test.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      section: null,
    }));
  }

  if (allQuestions.length === 0) {
    return res.status(400).json({
      message: "Test has no questions",
    });
  }

  // ❌ Already submitted
  const submitted = await Attempt.findOne({
    userId,
    testId,
    status: "submitted",
  });

  if (submitted) {
    return res.status(400).json({
      message: "You have already attempted this test",
    });
  }

  // 🔁 Resume attempt
  const existingAttempt = await Attempt.findOne({
    userId,
    testId,
    status: "ongoing",
  });

  if (existingAttempt) {
    if (new Date() > existingAttempt.expiresAt) {
      existingAttempt.status = "expired";
      await existingAttempt.save();

      return res.status(403).json({
        message: "Test already expired",
      });
    }

    const answerMap = {};
    existingAttempt.answers.forEach(a => {
      answerMap[a.questionId.toString()] = a.selectedOption;
    });

    const orderedQuestions = allQuestions.map(q => ({
      ...q,
      selectedOption: answerMap[q._id.toString()] ?? -1,
    }));

    return res.json({
      attemptId: existingAttempt._id,
      duration: test.duration,
      expiresAt: existingAttempt.expiresAt,
      questions: orderedQuestions,
      message: "Resuming previous attempt",
    });
  }

  // 🆕 Fresh attempt
  const expiresAt = new Date(
    Date.now() + test.duration * 60 * 1000
  );

  const shuffledQuestions = shuffle(allQuestions);

  //console.log("TOTAL QUESTIONS:", allQuestions.length);
  //console.log("SHUFFLED QUESTIONS:", shuffledQuestions.length);

  if (submitted) {
    return res.status(400).json({
      message: "You have already attempted this test",
    });
  }

  const attempt = await Attempt.findOneAndUpdate(
    { userId, testId },
    {
      $setOnInsert: {
        userId,
        testId,
        status: "ongoing",
        expiresAt,
        answers: shuffledQuestions.map(q => ({
          questionId: q._id,
          selectedOption: -1,
        })),
      },
    },
  {
    new: true,
    upsert: true,
  }
);

  return res.json({
    attemptId: attempt._id,
    duration: test.duration,
    expiresAt,
    questions: shuffledQuestions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      section: q.section, // 🔥 important for frontend later
      selectedOption: -1,
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
    const test = await Test.findById(attempt.testId);
    const resultData = await calculateScore(attempt, test);
  
    attempt.status = "submitted";
    attempt.submittedAt = new Date();
    await attempt.save();
  
    const result = await Result.create({
      userId: attempt.userId,
      testId: attempt.testId,
      ...resultData,
    });
  
    await calculateRanks(attempt.testId);
  
    return res.json({
      message: "Time over. Test auto-submitted",
      result,
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

/**
 * 
 */
exports.getAttemptStatus = async (req, res) => {
  const { testId } = req.params;
  const userId = req.userId;

  const submitted = await Attempt.findOne({
    userId,
    testId,
    status: "submitted",
  });

  if (submitted) {
    return res.json({ status: "submitted" });
  }

  const ongoing = await Attempt.findOne({
    userId,
    testId,
    status: "ongoing",
  });

  if (ongoing) {
    return res.json({
      status: "ongoing",
      attemptId: ongoing._id,
      expiresAt: ongoing.expiresAt,
    });
  }

  res.json({ status: "not_started" });
};