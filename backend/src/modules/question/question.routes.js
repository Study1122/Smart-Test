const router = require("express").Router();
const controller = require("./question.controller");
const auth = require("../../middlewares/auth.middleware");
const admin = require("../../middlewares/admin.middleware");

router.post("/", auth, admin, controller.createQuestion);
router.get("/exam/:examId", auth, admin, controller.getQuestionsByExam);

module.exports = router;