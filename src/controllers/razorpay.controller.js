const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Plan, Payment, Subscription } = require("../models");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findByPk(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      order,
      key: process.env.RAZORPAY_KEY // 👈 send key to frontend
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong")
    return res.redirect(req.get("Referer"));
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId,
      amount
    } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    await Payment.create({
      userId: req.user.id,   // must come from auth middleware
      planId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      status: "success"
    });

    await Subscription.upsert({
      userId: req.user.id,
      planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active"
    });

    res.json({ message: "Plan activated" });

  } catch (err) {
    console.log(err);
    req.flash("error", "Payment verification Failed")
    return res.redirect(req.get("Referer"));
  }
};
