// backend/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  getAllUsers,
  deleteUser,
  updatePassword,
  updateUser, // ADD THIS IMPORT
} from "../controllers/authController.js";
import { protect, supervisorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Supervisor creates users
router.post("/register", protect, supervisorOnly, register);

// Login
router.post("/login", login);

// Supervisor fetches all users
router.get("/users", protect, supervisorOnly, getAllUsers);

// Supervisor updates user
router.put("/users/:id", protect, supervisorOnly, updateUser); // ADD THIS LINE

router.delete("/delete/:id", protect, supervisorOnly, deleteUser);

// Update password
router.put("/password/:id", protect, supervisorOnly, updatePassword);

export default router;
