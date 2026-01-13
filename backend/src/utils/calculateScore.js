const Question = require("../modules/question/question.model");

module.exports = async function calculateScore(attempt, test) {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  const total = attempt.answers.length;

  // 🔥 Fetch all questions at once (OPTIMIZED)
  const questionIds = attempt.answers.map(a => a.questionId);
  const questions = await Question.find({
    _id: { $in: questionIds },
  }).lean();

  // Create lookup map
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q._id.toString()] = q;
  });

  // Scoring loop
  for (const ans of attempt.answers) {
    if (ans.selectedOption === -1) continue;

    attempted++;

    const question = questionMap[ans.questionId.toString()];
    if (!question) continue;

    if (ans.selectedOption === question.correctAnswer) {
      correct++;
      score += test.marking.correct;
    } else {
      wrong++;
      score -= test.marking.negative;
    }
  }

  const notAnswered = total - attempted;

  const accuracy =
    attempted === 0
      ? 0
      : Math.round((correct / attempted) * 100);

  return {
    score,
    correct,
    wrong,
    attempted,
    notAnswered,
    accuracy,
  };
};