const Question = require("../modules/question/question.model");

module.exports = async function calculateScore(attempt, test) {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  for (const ans of attempt.answers) {
    if (ans.selectedOption === -1) continue;

    attempted++;
    const question = await Question.findById(ans.questionId);

    if (ans.selectedOption === question.correctAnswer) {
      correct++;
      score += test.marking.correct;
    } else {
      wrong++;
      score -= test.marking.negative;
    }
  }

  const accuracy = attempted === 0
    ? 0
    : Math.round((correct / attempted) * 100);

  return { score, correct, wrong, attempted, accuracy };
};