const Result = require("./result.model");

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