// frontend/src/pages/OfficeDashboard.jsx
import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import generateReport from "../utils/reportGenerator";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function OfficeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to show only requests created by this office user
      const myRequests = res.data.filter(
        (r) => r.requestedBy && r.requestedBy._id === user?.id
      );
      setRequests(myRequests);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchRequests();
    // eslint-disable-next-line
  }, [user]);

  const createRequest = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending request...");
    try {
      await axios.post(
        "http://localhost:5000/api/requests/create",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request sent — you will be assisted shortly", {
        id: toastId,
      });
      setTitle("");
      setDescription("");
      fetchRequests();
    } catch (err) {
      console.error("Create error:", err.response?.data || err.message);
      toast.error("Failed to create request", { id: toastId });
    }
  };

  // Function to mark request as resolved
  const markResolved = async (requestId) => {
    const toastId = toast.loading("Marking as resolved...");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/requests/resolve",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Request marked as resolved", {
        id: toastId,
      });
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error("Resolve error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to mark as resolved", {
        id: toastId,
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏢 Office Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => generateReport(requests, "office")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download Report
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <form
        onSubmit={createRequest}
        className="mb-8 bg-white p-4 rounded-lg shadow-md"
      >
        <h2 className="font-semibold text-lg mb-2">Create New Request</h2>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Request
        </button>
      </form>

      <h2 className="text-xl font-bold mb-3">My Requests</h2>
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Title</th>
            <th className="p-2">Description</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id} className="border-b text-center">
              <td className="p-2">{r.title}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2">
                {r.status === "resolved" ? "✅ Resolved" : "❌ Pending"}
              </td>
              <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="p-2">
                {/* Show resolve button only if pending */}
                {r.status !== "resolved" && (
                  <button
                    onClick={() => markResolved(r._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    ✅ Mark Resolved
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
