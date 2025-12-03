import User from "../models/User.js";

// 📌 GET all Office + Student accounts
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["office", "student"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// 📌 Supervisor creates a new Office or Student user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["office", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const newUser = await User.create({ name, email, password, role });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
};

// 📌 Delete user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
