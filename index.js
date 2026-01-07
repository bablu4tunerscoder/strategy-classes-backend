const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/user/user_root_routes");
const adminRoutes = require("./routes/admin/admin_root_routes");


const path = require("path");
const cors = require("cors");

dotenv.config();


connectDB();

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://adminpanel.strategypcs.in",
  "https://www.strategypcs.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);


// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/quiz", quizRoutes);
// app.use("/api/Tseries", TestSeriesRoutes);
// app.use("/api/subject", subjectRoutes);
// app.use("/api/course", courseRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/Tseriesquestions", TSeriesRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use("/api/uploads", uploadRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/series", tsProgressRoute);
// app.use("/api", youtubeRoutes); 

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
