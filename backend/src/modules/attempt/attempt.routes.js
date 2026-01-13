const router = require("express").Router();
const controller = require("./attempt.controller");
const auth = require("../../middlewares/auth.middleware");

router.post("/start", auth, controller.startTest);
router.post("/save", auth, controller.saveAnswer);
router.post("/submit", auth, controller.submitTest);
router.get("/status/:testId", auth, controller.getAttemptStatus);

module.exports = router;