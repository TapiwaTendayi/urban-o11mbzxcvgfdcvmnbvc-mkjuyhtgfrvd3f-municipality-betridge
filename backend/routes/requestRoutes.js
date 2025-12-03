// backend/routes/requestRoutes.js
import express from "express";
import {
  createRequest,
  assignRequest,
  markResolved,
  getRequests,
} from "../controllers/requestController.js";
import { protect, supervisorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Office creates request
router.post("/create", protect, createRequest);

// Supervisor assigns request
router.post("/assign", protect, supervisorOnly, assignRequest);

// Office resolves request (changed from student-only to general protect)
// The controller now checks if user is office and original requester
router.post("/resolve", protect, markResolved);

// All roles fetch requests (filtered)
router.get("/", protect, getRequests);

export default router;
