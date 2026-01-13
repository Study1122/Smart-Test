const Result = require("../modules/result/result.model");

module.exports = async function calculateRanks(testId) {
  const results = await Result.find({ testId })
    .sort({ score: -1, createdAt: 1 });

  const total = results.length;
  let currentRank = 1;

  for (let i = 0; i < total; i++) {
    if (i > 0 && results[i].score < results[i - 1].score) {
      currentRank = i + 1;
    }

    // assign rank
    results[i].rank = currentRank;

    // ✅ USE STORED RANK (NOT imaginary variable)
    results[i].percentile = Math.round(
      ((total - results[i].rank + 1) / total) * 100
    );

    await results[i].save();
  }
};