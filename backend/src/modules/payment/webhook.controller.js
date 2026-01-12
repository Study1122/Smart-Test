const crypto = require("crypto");
const Payment = require("./payment.model");

exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body.event;

  if (event === "payment.captured") {
    const orderId = req.body.payload.payment.entity.order_id;

    await Payment.findOneAndUpdate(
      { orderId },
      { status: "paid" }
    );
  }

  res.json({ status: "ok" });
};