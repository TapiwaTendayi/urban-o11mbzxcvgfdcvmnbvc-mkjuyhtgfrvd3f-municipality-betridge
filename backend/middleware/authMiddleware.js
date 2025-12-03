// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// 🔒 Supervisor-only middleware
export const supervisorOnly = (req, res, next) => {
  if (req.user.role !== "supervisor") {
    return res
      .status(403)
      .json({ message: "Access denied — Supervisors only" });
  }
  next();
};
