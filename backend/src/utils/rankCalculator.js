const Result = require("../modules/result/result.model");

module.exports = async function calculateRanks(testId) {
  const results = await Result.find({ testId }).sort({ score: -1 });

  const total = results.length;

  for (let i = 0; i < total; i++) {
    results[i].rank = i + 1;
    results[i].percentile = Math.round(
      ((total - i) / total) * 100
    );
    await results[i].save();
  }
};