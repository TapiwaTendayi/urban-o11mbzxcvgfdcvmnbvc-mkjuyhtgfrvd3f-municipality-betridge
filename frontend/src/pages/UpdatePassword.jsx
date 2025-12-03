import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function UpdatePassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const found = res.data.find((u) => u._id === id);
      setUser(found);
    } catch (err) {
      console.error("Failed to load user", err);
      toast.error("Error loading user");
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const t = toast.loading("Updating password...");
      await axios.put(
        `http://localhost:5000/api/auth/password/${id}`,
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss(t);
      toast.success("Password updated successfully");
      navigate("/supervisor/users");
    } catch (err) {
      toast.dismiss();
      console.error("Password update error:", err.response?.data);
      toast.error("Failed to update password");
    }
  };

  if (!user) return <div className="p-6">Loading user...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">
          Change Password for {user.name}
        </h1>

        <form onSubmit={updatePassword} className="space-y-3">
          <div>
            <label className="block mb-1 font-semibold">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="border p-2 w-full rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="border p-2 w-full rounded"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show password
          </label>

          <div className="flex gap-2 mt-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Update Password
            </button>
            <button
              type="button"
              onClick={() => navigate("/supervisor/users")}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
