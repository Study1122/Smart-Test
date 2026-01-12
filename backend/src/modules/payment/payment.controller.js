const razorpay = require("../../config/razorpay");
const crypto = require("crypto");
const Payment = require("./payment.model");

exports.createOrder = async (req, res) => {
  const { testId, amount } = req.body;

  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  await Payment.create({
    userId: req.userId,
    testId,
    orderId: order.id,
    amount,
    status: "created",
  });

  res.json({
    orderId: order.id,
    key: process.env.RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
  });
};


exports.verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  const body = orderId + "|" + paymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const payment = await Payment.findOne({ orderId });
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  payment.paymentId = paymentId;
  payment.signature = signature;
  payment.status = "paid";
  await payment.save();

  res.json({ message: "Payment verified successfully" });
};