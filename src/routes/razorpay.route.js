const express = require("express");
const razorpayController = require("../controllers/razorpay.controller")
const auth = require("../middleware/auth.middleware")



const router = express.Router();
console.log("inside the razorpayroute");

router.post("/create", auth, razorpayController.createOrder);
router.post("/payment/verify", auth, razorpayController.verifyPayment);



module.exports = router;
