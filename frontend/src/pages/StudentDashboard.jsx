// frontend/src/pages/StudentDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import generateReport from "../utils/reportGenerator";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching requests");
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchRequests();
  }, []);

  const markResolved = async (id) => {
    const toastId = toast.loading("Marking resolved...");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/requests/resolve",
        { requestId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Marked resolved", { id: toastId });
      fetchRequests();
    } catch (err) {
      console.error("Resolve error:", err.response?.data || err.message);
      toast.error("Failed to mark resolved", { id: toastId });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Student Dashboard 🎓</h1>
        <div className="flex gap-2">
          <button
            onClick={() => generateReport(requests, "student")}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Download Report
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Title</th>
            <th>Description</th>
            <th>Requested By</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const isAssignedToMe =
              r.assignedTo && r.assignedTo._id === (user?.id || user?._id);
            return (
              <tr key={r._id} className="border-t text-center">
                <td>{r.title}</td>
                <td>{r.description}</td>
                <td>{r.requestedBy?.name || "—"}</td>
                <td>{r.assignedTo?.name || "Unassigned"}</td>
                <td>
                  {r.status === "resolved" ? "✅ Resolved" : "❌ Pending"}
                </td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  {r.status !== "resolved" && isAssignedToMe ? (
                    <button
                      onClick={() => markResolved(r._id)}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      ✅ Resolve
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
