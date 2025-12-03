// frontend/src/pages/SupervisorDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import generateReport from "../utils/reportGenerator";
import { useNavigate } from "react-router-dom";

export default function SupervisorDashboard() {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [reqRes, userRes] = await Promise.all([
        axios.get("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRequests(reqRes.data);
      setStudents(userRes.data.filter((u) => u.role === "student"));
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      toast.error("Failed to load dashboard");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchData();
    // eslint-disable-next-line
  }, []);

  const assignTask = async (requestId, studentId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/requests/assign",
        { requestId, studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Assigned");
      fetchData();
    } catch (err) {
      console.error("Assign error:", err.response?.data || err.message);
      toast.error("Failed to assign student");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Supervisor Dashboard 🧑‍🏫</h1>
        <div className="flex gap-2">
          <button
            onClick={() => generateReport(requests, "supervisor")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            📄 Download PDF
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate("/supervisor/users")}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        👥 Manage Users
      </button>

      <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Office</th>
              <th className="p-3 border">Assigned To</th>
              <th className="p-3 border">Assign Student</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Created</th>
            </tr>
          </thead>

          <tbody>
            {requests.length ? (
              requests.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3 border">{r.title}</td>
                  <td className="p-3 border">{r.description}</td>
                  <td className="p-3 border">
                    {r.requestedBy?.office || "N/A"}
                  </td>
                  <td className="p-3 border">
                    {r.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="p-3 border">
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        e.target.value && assignTask(r._id, e.target.value)
                      }
                      className="border p-2 rounded"
                    >
                      <option value="">Select Student</option>
                      {students.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 border">
                    {r.status === "resolved" ? "✅ Resolved" : "❌ Pending"}
                  </td>
                  <td className="p-3 border">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  No requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
