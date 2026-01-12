const Attempt = require("./attempt.model");
const Test = require("../test/test.model");
const Result = require("../result/result.model");
const shuffle = require("../../utils/shuffleQuestions");
const calculateScore = require("../../utils/calculateScore");
/**
 * 📄 START TEST
 */
exports.startTest = async (req, res) => {
  const { testId } = req.body;
  const userId = req.userId; // will come from auth later

  const test = await Test.findById(testId).populate("questions");
  if (!test) return res.status(404).json({ message: "Test not found" });

  const existing = await Attempt.findOne({
    userId,
    testId,
    status: "ongoing",
  });
  if (existing) return res.json(existing);

  const shuffledQuestions = shuffle(test.questions);

  const attempt = await Attempt.create({
    userId,
    testId,
    answers: shuffledQuestions.map(q => ({
      questionId: q._id,
      selectedOption: -1,
    })),
  });

  res.json({
    attemptId: attempt._id,
    duration: test.duration,
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

  res.json({
    message: "Test submitted",
    result,
  });
};

