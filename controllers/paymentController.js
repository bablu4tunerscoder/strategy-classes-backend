const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Course = require("../models/courseModel");
const Quiz = require("../models/quizdataModel");
const Upload = require("../models/uploadModels");

// Create Payment Order

const createOrder = async (req, res) => {
  try {
    const { userId, course_id, quiz_id, upload_id, amount } = req.body;

    // Check user exists
    const user = await User.findOne({ userId: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check that at least one item id is provided
    if (!course_id && !quiz_id && (!upload_id || upload_id.length === 0)) {
      return res.status(400).json({
        message:
          "At least one item id (course_id, quiz_id, upload_id) is required",
      });
    }
    // Create order in Razorpay
    const options = {
      amount: amount * 100, // Convert to paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create payment entry in DB
    const paymentData = {
      userId,
      orderId: order.id,
      amount,
      status: "pending",
      course_id: course_id || null, // Store as single value
      quiz_id: quiz_id || null, // Store as single value
      upload_id: upload_id
        ? Array.isArray(upload_id)
          ? upload_id
          : [upload_id]
        : [], // Store as array
    };

    const newPayment = new Payment(paymentData);
    await newPayment.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment initiation failed", error });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, razorpaySignature } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Order not found" });

    if (!paymentId) {
      payment.status = "failed";
      payment.failureReason = "Payment was cancelled by the user.";
      await payment.save();
      return res.status(400).json({ message: "Payment cancelled" });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      payment.status = "failed";
      payment.paymentId = null;
      payment.failureReason = "Invalid Razorpay Signature";
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Mark Payment as Paid
    payment.paymentId = paymentId;
    payment.status = "paid";
    payment.failureReason = null;
    await payment.save();

    res.json({ success: true, message: "Payment successful", payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment verification failed", error });
  }
};

// Cancel Payment (User cancels Razorpay popup)
const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Order not found" });

    // Mark payment as failed
    payment.status = "failed";
    payment.failureReason = "User closed the payment window.";
    await payment.save();

    res.json({ success: true, message: "Payment marked as failed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel payment", error });
  }
};

// GET payments by userId with optional filters
const paymetsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { course_id, quiz_id, upload_id } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    let filter = { userId, status: "paid" };
    if (course_id) filter.course_id = course_id;
    if (quiz_id) filter.quiz_id = quiz_id;
    if (upload_id) filter.upload_id = { $in: [upload_id] };

    const payments = await Payment.find(filter);
    if (payments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No payment records found" });
    }

    // Fetch related data separately without joins
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        let courseData = null,
          quizData = null,
          uploadData = [];

        if (payment.course_id) {
          courseData = await Course.findOne({ course_id: payment.course_id });
        }
        if (payment.quiz_id) {
          quizData = await Quiz.findOne({ quiz_id: payment.quiz_id });
        }
        if (payment.upload_id.length > 0) {
          uploadData = await Upload.find({
            upload_id: { $in: payment.upload_id },
          });
        }

        return {
          ...payment.toObject(),
          courseDetails: courseData,
          quizDetails: quizData,
          uploadDetails: uploadData,
        };
      })
    );

    res.json({ status: "1", data: enrichedPayments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// notes upload with user_id and upload_id
const uploaddedNotes = async (req, res) => {
  try {
    const { userId, upload_id } = req.body;

    // Validate input
    if (!userId || !upload_id || upload_id.length === 0) {
      return res
        .status(400)
        .json({ message: "userId and upload_id are required" });
    }

    // Check if user exists
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create payment entry with 'paid' status
    const paymentData = new Payment({
      userId,
      upload_id: Array.isArray(upload_id) ? upload_id : [upload_id], // Ensure array
      amount: 0, // No amount required for this API
      status: "paid",
      orderId: `manual_${Date.now()}`, // Generate a manual order ID
    });

    await paymentData.save();

    res.json({ status: "1", message: "Upload marked as paid successfully" });
  } catch (error) {
    console.error("Error in uploaddedNotes API:", error);
    res.status(500).json({ message: "Failed to mark upload as paid", error });
  }
};

// find user with paid courses and paid quizess and uploads models
const fetchAllUsersPurchaseHistory = async (req, res) => {
  try {
    // Fetch all payments
    const payments = await Payment.find();

    // ✅ Instead of 404, return an empty array with a 200 status
    if (!payments.length) {
      return res.status(200).json({ totalUsers: 0, userPurchases: [] });
    }

    // Group purchases by userId
    const userPurchasesMap = new Map();

    await Promise.all(
      payments.map(async (payment) => {
        let userId = payment.userId;
        if (!userPurchasesMap.has(userId)) {
          // ✅ Fetch user details
          const userDetails = await User.findOne({ userId }).select(
            "userId name email phoneNumber status"
          );

          userPurchasesMap.set(userId, { user: userDetails, purchases: [] });
        }

        let courseDetails = null;
        let quizDetails = null;
        let uploadDetails = [];

        // Fetch course details if course_id exists
        if (payment.course_id) {
          courseDetails = await Course.findOne({
            course_id: payment.course_id,
          }).select("title description price");
        }

        // Fetch quiz details if quiz_id exists
        if (payment.quiz_id) {
          quizDetails = await Quiz.findOne({ quiz_id: payment.quiz_id }).select(
            "title topic price"
          );
        }

        // Fetch upload details if upload_id exists
        if (payment.upload_id && payment.upload_id.length > 0) {
          uploadDetails = await Upload.find({
            upload_id: { $in: payment.upload_id },
          }).select("upload_title upload_description upload_price upload_type");
        }

        userPurchasesMap.get(userId).purchases.push({
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          orderId: payment.orderId,
          status: payment.status,
          purchaseDate: payment.createdAt,
          course: courseDetails,
          quiz: quizDetails,
          uploads: uploadDetails,
        });
      })
    );

    // Convert Map to Array
    const userPurchases = Array.from(userPurchasesMap.values());

    // Count total unique users
    const totalUsers = userPurchases.length;

    res.status(200).json({
      totalUsers, // ✅ Unique user count
      userPurchases, // ✅ User-wise purchase history
    });
  } catch (error) {
    console.error("Error fetching all users' purchase history:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


const getRevenue = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Year is required." });
    }

    const targetYear = parseInt(year);

    // Revenue by Month
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: {
            $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${targetYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total Yearly Revenue
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: {
            $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${targetYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      monthlyRevenue,
      totalRevenue: totalRevenue.length ? totalRevenue[0].totalRevenue : 0,
    });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  cancelPayment,
  paymetsByUser,
  uploaddedNotes,
  fetchAllUsersPurchaseHistory,
  getRevenue,
};
