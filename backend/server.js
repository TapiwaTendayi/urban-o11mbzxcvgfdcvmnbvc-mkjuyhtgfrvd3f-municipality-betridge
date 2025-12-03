import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // ⭐ ADD THIS
import expressListRoutes from "express-list-routes";

// ✅ Load environment variables
dotenv.config();

// 🧠 Connect to MongoDB
connectDB();

// ⚙️ Initialize Express app
const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 🌍 Test route
app.get("/", (req, res) => {
  res.send("✅ ITSolve Backend is running...");
});

// 🛠️ API Routes
console.log("🔹 Loading routes...");

app.use("/api/auth", authRoutes); // Login / Register
app.use("/api/requests", requestRoutes); // Requests system
app.use("/api/users", userRoutes); // ⭐ Supervisor User Management

console.log("✅ Routes loaded!");

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("📜 Available Routes:");
  expressListRoutes(app, { prefix: "" });
});
