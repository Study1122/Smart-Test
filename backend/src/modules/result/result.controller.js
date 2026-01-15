const Result = require("./result.model");
const Attempt = require("../attempt/attempt.model");
const Test = require("../test/test.model");

exports.getMyResult = async (req, res) => {
  const { testId } = req.params;

  const result = await Result.findOne({
    testId,
    userId: req.userId,
  });

  if (!result)
    return res.status(404).json({ message: "Result not found" });

  res.json(result);
};

/**
 * get Leaderboard
 */

exports.getLeaderboard = async (req, res) => {
  const { testId } = req.params;

  const leaderboard = await Result.find({ testId })
    .sort({ rank: 1 })
    .limit(50)
    .populate("userId", "name");

  res.json(leaderboard);
};

/**
 * 
 */

exports.getResultAnalysis = async (req, res) => {
  const { testId } = req.params;
  const userId = req.userId;

  const attempt = await Attempt.findOne({
    userId,
    testId,
    status: "submitted",
  });

  if (!attempt) {
    return res.status(404).json({ message: "Result not found" });
  }

  const test = await Test.findById(testId)
    .populate("questions")
    .populate("sections.questions");

  let analysis = [];

  // 🔹 CASE 1: SECTION-BASED TEST
  if (test.sections && test.sections.length > 0) {
    for (const section of test.sections) {
      for (const q of section.questions) {
        const answer = attempt.answers.find(
          a => a.questionId.toString() === q._id.toString()
        );

        analysis.push({
          _id: q._id,
          section: section.name,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          selectedOption: answer?.selectedOption ?? -1,
          explanation: q.explanation,
          isCorrect:
            answer?.selectedOption === q.correctAnswer,
        });
      }
    }
  }
  // 🔹 CASE 2: OLD TEST (NO SECTIONS)
  else {
    for (const q of test.questions) {
      const answer = attempt.answers.find(
        a => a.questionId.toString() === q._id.toString()
      );

      analysis.push({
        _id: q._id,
        section: "General",
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedOption: answer?.selectedOption ?? -1,
        explanation: q.explanation,
        isCorrect:
          answer?.selectedOption === q.correctAnswer,
      });
    }
  }

  res.json({
    testId,
    analysis,
  });
};