// backend/controllers/authController.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

/* 
   REGISTER USER (Supervisor-only)
 */
export const register = async (req, res) => {
  try {
    // 🔒 Only supervisors can create users
    if (req.user.role !== "supervisor") {
      return res.status(403).json({
        message: "Only supervisors can register new users",
      });
    }

    const { name, email, password, role, office } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      office,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/* ============================================================
   UPDATE USER (Supervisor-only)
============================================================ */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, office, password } = req.body;

    // 🔒 Only supervisors can update users
    if (req.user.role !== "supervisor") {
      return res.status(403).json({
        message: "Access denied — supervisors only",
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update other fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (office !== undefined) user.office = office;

    // Update password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json({
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    return res.status(500).json({ message: "Server error updating user" });
  }
};

/* ============================================================
   LOGIN
============================================================ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // include name for UI
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        office: user.office,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/* ============================================================
   SUPERVISOR FETCH ALL USERS
============================================================ */
export const getAllUsers = async (req, res) => {
  try {
    // 🔒 Only supervisors can fetch users
    if (req.user.role !== "supervisor") {
      return res.status(403).json({
        message: "Access denied — supervisors only",
      });
    }

    const users = await User.find().select("name email role office");

    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// 🔥 DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Server error deleting user" });
  }
};

// 🔥 UPDATE USER PASSWORD
export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;

    if (!newPassword) {
      return res.status(400).json({ message: "Password required" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashed });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    return res.status(500).json({ message: "Server error updating password" });
  }
};
// At the end of authController.js, NO export statement needed - using individual exports
