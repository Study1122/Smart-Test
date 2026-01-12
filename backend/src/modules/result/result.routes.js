const router = require("express").Router();
const controller = require("./result.controller");
const auth = require("../../middlewares/auth.middleware");

router.get("/:testId/me", auth, controller.getMyResult);
router.get("/:testId/leaderboard", controller.getLeaderboard);

module.exports = router;