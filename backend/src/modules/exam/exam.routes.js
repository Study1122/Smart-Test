const router = require("express").Router();
const controller = require("./exam.controller");
const auth = require("../../middlewares/auth.middleware");
const admin = require("../../middlewares/admin.middleware");

router.post("/", auth, admin, controller.createExam);
router.get("/", controller.getAllExams);

module.exports = router;