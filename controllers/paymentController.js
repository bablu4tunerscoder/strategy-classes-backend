const Payment = require("../models/paymentModel");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");


/* ================= CREATE ORDER ================= */
const createOrder = async (req, res) => {
  try {
    const { course, quiz, uploads, amount } = req.body;
    const user = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    if (!course && !quiz && (!uploads || uploads.length === 0)) {
      return res.status(400).json({
        message: "course or quiz or uploads required",
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    const payment = await Payment.create({
      user,
      course: course || null,
      quiz: quiz || null,
      uploads: uploads || [],
      amount,
      orderId: order.id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ================= VERIFY PAYMENT ================= */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, razorpaySignature } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Order not found" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      payment.status = "failed";
      payment.failureReason = "Signature mismatch";
      await payment.save();

      return res.status(400).json({ message: "Invalid signature" });
    }

    payment.paymentId = paymentId;
    payment.status = "paid";
    payment.failureReason = null;
    await payment.save();

    res.json({ success: true, message: "Payment successful" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ================= CANCEL PAYMENT ================= */
const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Order not found" });
    }

    payment.status = "failed";
    payment.failureReason = "User cancelled payment";
    await payment.save();

    res.json({ message: "Payment cancelled" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ================= USER PURCHASE HISTORY ================= */
const paymentsByUser = async (req, res) => {
  try {
    const user = req.user._id;

    const payments = await Payment.find({
      user,
      status: "paid",
    })
      .populate("course")
      .populate("quiz")
      .populate("uploads");

    res.json({ count: payments.length, payments });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ================= ADMIN: ALL USERS PURCHASES ================= */
const fetchAllUsersPurchaseHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "paid" })
      .populate("user", "name email phoneNumber")
      .populate("course")
      .populate("quiz")
      .populate("uploads");

    res.json({
      totalPayments: payments.length,
      payments,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ================= FREE NOTES / MANUAL PAID ================= */
const uploadedNotes = async (req, res) => {
  try {
    const user = req.user._id;
    const { uploads } = req.body;

    if (!uploads || uploads.length === 0) {
      return res.status(400).json({ message: "uploads required" });
    }

    const payment = await Payment.create({
      user,
      uploads,
      amount: 0,
      orderId: `manual_${Date.now()}`,
      status: "paid",
    });

    res.json({ message: "Uploads unlocked", payment });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ================= REVENUE REPORT ================= */
const getRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Year required" });

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${Number(year) + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ revenue });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  cancelPayment,
  paymentsByUser,
  uploadedNotes,
  fetchAllUsersPurchaseHistory,
  getRevenue,
};
