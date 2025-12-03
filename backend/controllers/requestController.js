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
   OFFICE USER MARKS THEIR OWN REQUEST AS RESOLVED
   (Modified: Previously student-only, now office-only)
============================================================ */
export const markResolved = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Get current user
    const currentUser = await User.findById(req.user.id);

    // Only office users can resolve requests
    if (currentUser.role !== "office") {
      return res.status(403).json({
        message: "Only office users can mark requests as resolved",
      });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Check if current office user is the one who created the request
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only resolve requests that you created",
      });
    }

    // Update request status
    request.status = "resolved";
    request.resolvedAt = new Date();
    // Changed from resolvedByStudent to resolvedByOffice
    request.resolvedByOffice = req.user.id;

    await request.save();

    const updated = await Request.findById(requestId)
      .populate("requestedBy", "name office email")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("resolvedByOffice", "name email");

    return res.json({
      message: "Request marked as resolved",
      request: updated,
    });
  } catch (err) {
    console.error("❌ Error marking resolved:", err);
    return res.status(500).json({ message: "Server error marking resolved" });
  }
};

/* ============================================================
   ROLE-BASED REQUEST LISTING
   (Updated: Office users don't see assignedTo information)
============================================================ */
export const getRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let requests = [];

    // Supervisor sees all (with full details)
    if (user.role === "supervisor") {
      requests = await Request.find()
        .populate("requestedBy", "name office email")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("resolvedByOffice", "name email")
        .sort({ createdAt: -1 });

      return res.json(requests);
    }

    // Student sees all (read-only view with assignment info)
    if (user.role === "student") {
      requests = await Request.find()
        .populate("requestedBy", "name office email")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("resolvedByOffice", "name email")
        .sort({ createdAt: -1 });

      return res.json(requests);
    }

    // Office sees only their own requests WITHOUT assignment details
    if (user.role === "office") {
      requests = await Request.find({ requestedBy: user._id })
        .select("-assignedTo -assignedBy") // EXCLUDE assignment fields
        .populate("resolvedByOffice", "name email")
        .sort({ createdAt: -1 });

      return res.json(requests);
    }

    res.status(403).json({ message: "Unknown role" });
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    return res.status(500).json({ message: "Server error fetching requests" });
  }
};
