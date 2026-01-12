const router = require("express").Router();
const controller = require("./payment.controller");
const auth = require("../../middlewares/auth.middleware");

router.post("/create-order", auth, controller.createOrder);
router.post("/verify", auth, controller.verifyPayment);

module.exports = router;