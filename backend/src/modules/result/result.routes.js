const router = require("express").Router();
const controller = require("./result.controller");
const auth = require("../../middlewares/auth.middleware");

router.get("/:testId/me", auth, controller.getMyResult);
router.get("/:testId/leaderboard", controller.getLeaderboard);
router.get("/analysis/:testId",auth,controller.getResultAnalysis);

module.exports = router;