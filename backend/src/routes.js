const router = require("express").Router();

router.use("/payment", require("./modules/payment/payment.routes"));
router.post(
  "/payment/webhook",
  require("./modules/payment/webhook.controller").razorpayWebhook
);
router.use("/auth", require("./modules/auth/auth.routes"));
router.use("/exam", require("./modules/exam/exam.routes"));
router.use("/question", require("./modules/question/question.routes"));
router.use("/test", require("./modules/test/test.routes"));
router.use("/attempt", require("./modules/attempt/attempt.routes"));
router.use("/result", require("./modules/result/result.routes"));


module.exports = router;

module.exports = router;