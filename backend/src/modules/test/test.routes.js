const router = require("express").Router();
const controller = require("./test.controller");
const auth = require("../../middlewares/auth.middleware");
const admin = require("../../middlewares/admin.middleware");

router.post("/", auth, admin, controller.createTest);
router.get("/exam/:examId", controller.getTestsByExam);

module.exports = router;