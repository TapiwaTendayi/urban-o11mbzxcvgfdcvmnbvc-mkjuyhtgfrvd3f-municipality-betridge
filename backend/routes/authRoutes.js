// backend/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  getAllUsers,
  deleteUser,
  updatePassword,
} from "../controllers/authController.js";
import { protect, supervisorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Supervisor creates users
router.post("/register", protect, supervisorOnly, register);

// Login
router.post("/login", login);

// Supervisor fetches all users
router.get("/users", protect, supervisorOnly, getAllUsers);

router.delete("/delete/:id", protect, supervisorOnly, deleteUser);

// 🔥 ALSO add update password
router.put("/password/:id", protect, supervisorOnly, updatePassword);

export default router;
