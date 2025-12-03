// backend/controllers/requestController.js
import Request from "../models/Request.js";
import User from "../models/User.js";

/* ============================================================
   OFFICE CREATES REQUEST
============================================================ */
export const createRequest = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Title and description required" });

    const newReq = await Request.create({
      title,
      description,
      requestedBy: req.user.id, // office user
    });

    return res.status(201).json({
      message: "Request created",
      request: newReq,
    });
  } catch (err) {
    console.error("❌ Error creating request:", err);
    return res.status(500).json({ message: "Server error creating request" });
  }
};

/* ============================================================
   SUPERVISOR ASSIGNS REQUEST
============================================================ */
export const assignRequest = async (req, res) => {
  try {
    const { requestId, studentId } = req.body;

    if (!requestId || !studentId)
      return res
        .status(400)
        .json({ message: "requestId and studentId required" });

    const student = await User.findById(studentId);
    if (!student || student.role !== "student")
      return res.status(400).json({ message: "Invalid studentId" });

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.assignedTo = studentId;
    request.assignedBy = req.user.id;
    await request.save();

    const updated = await Request.findById(requestId)
      .populate("requestedBy", "name office email")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role");

    return res.json({
      message: "Task assigned successfully",
      request: updated,
    });
  } catch (err) {
    console.error("❌ Error assigning request:", err);
    return res.status(500).json({ message: "Server error assigning request" });
  }
};

/* ============================================================
   STUDENT MARKS RESOLVED
============================================================ */
export const markResolved = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // only assigned student can resolve
    if (request.assignedTo?.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "This request is not assigned to you" });

    request.status = "resolved";
    request.resolvedAt = new Date();
    request.resolvedByStudent = req.user.id;

    await request.save();

    const updated = await Request.findById(requestId)
      .populate("requestedBy", "name office email")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("resolvedByStudent", "name email");

    return res.json({
      message: "Request resolved",
      request: updated,
    });
  } catch (err) {
    console.error("❌ Error marking resolved:", err);
    return res.status(500).json({ message: "Server error marking resolved" });
  }
};

/* ============================================================
   ROLE-BASED REQUEST LISTING
============================================================ */
export const getRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let requests = [];

    // Supervisor sees all
    if (user.role === "supervisor") {
      requests = await Request.find()
        .populate("requestedBy", "name office email")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("resolvedByStudent", "name email")
        .sort({ createdAt: -1 });

      return res.json(requests);
    }

    // Student sees all (but can only resolve assigned ones)
    if (user.role === "student") {
      requests = await Request.find()
        .populate("requestedBy", "name office email")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("resolvedByStudent", "name email")
        .sort({ createdAt: -1 });

      return res.json(requests);
    }

    // Office sees only their own
    if (user.role === "office") {
      requests = await Request.find({ requestedBy: user._id })
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("resolvedByStudent", "name email")
        .sort({ createdAt: -1 });

      return res.json(requests);
    }

    res.status(403).json({ message: "Unknown role" });
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    return res.status(500).json({ message: "Server error fetching requests" });
  }
};
