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

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // SHOW ALL REQUESTS (not filtering by assignment)
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

      <p className="mb-4 text-gray-600">
        View all IT requests. Only the office user who created a request can
        mark it as resolved.
      </p>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Title</th>
            <th>Description</th>
            <th>Requested By (Office)</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Created</th>
            {/* No Action column - students cannot resolve */}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id} className="border-t text-center">
              <td>{r.title}</td>
              <td>{r.description}</td>
              <td>{r.requestedBy?.name || "—"}</td>
              <td>{r.assignedTo?.name || "Not assigned"}</td>
              <td>{r.status === "resolved" ? "✅ Resolved" : "❌ Pending"}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
