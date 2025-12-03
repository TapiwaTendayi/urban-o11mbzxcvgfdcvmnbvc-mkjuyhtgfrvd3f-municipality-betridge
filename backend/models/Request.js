// backend/models/Request.js
import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // who created the request (Office user)
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // supervisor who assigned
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // student assigned to handle the request
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // single global status (student resolves -> becomes "resolved")
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },

    // resolved info (set when a student resolves)
    resolvedAt: { type: Date, default: null },
    resolvedByStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", RequestSchema);
