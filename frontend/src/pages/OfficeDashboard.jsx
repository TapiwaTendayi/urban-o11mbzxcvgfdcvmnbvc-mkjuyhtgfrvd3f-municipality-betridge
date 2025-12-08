// frontend/src/pages/OfficeDashboard.jsx
import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import generateReport from "../utils/reportGenerator";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function OfficeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [displayedRequests, setDisplayedRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    status: "all",
    month: "",
    year: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // 20 items per page
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // 10 years back
  const months = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myRequests = res.data.filter(
        (r) => r.requestedBy && r.requestedBy._id === user?.id
      );
      setAllRequests(myRequests);
      setFilteredRequests(myRequests);
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

  // Apply filters
  useEffect(() => {
    let filtered = [...allRequests];

    if (reportFilters.status && reportFilters.status !== "all") {
      filtered = filtered.filter((req) => req.status === reportFilters.status);
    }

    if (reportFilters.month) {
      filtered = filtered.filter((req) => {
        const reqMonth = new Date(req.createdAt).getMonth() + 1;
        return reqMonth === parseInt(reportFilters.month);
      });
    }

    if (reportFilters.year) {
      filtered = filtered.filter((req) => {
        const reqYear = new Date(req.createdAt).getFullYear();
        return reqYear === parseInt(reportFilters.year);
      });
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allRequests, reportFilters]);

  // Pagination logic
  useEffect(() => {
    // Calculate total pages
    const total = Math.ceil(filteredRequests.length / itemsPerPage);
    setTotalPages(total || 1);

    // Calculate start and end indices
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get items for current page
    const itemsForPage = filteredRequests.slice(startIndex, endIndex);
    setDisplayedRequests(itemsForPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

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
      fetchRequests();
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setReportFilters({
      status: "all",
      month: "",
      year: "",
    });
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏢 Office Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={() =>
              generateReport(
                allRequests,
                "office",
                reportFilters,
                true,
                filteredRequests.length
              )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download Full Report
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg mb-3">Filter Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={reportFilters.status}
                onChange={handleFilterChange}
                className="border p-2 rounded w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                name="month"
                value={reportFilters.month}
                onChange={handleFilterChange}
                className="border p-2 rounded w-full"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                name="year"
                value={reportFilters.year}
                onChange={handleFilterChange}
                className="border p-2 rounded w-full"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
              >
                Reset Filters
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Total: {filteredRequests.length} requests | Showing page{" "}
            {currentPage} of {totalPages}
          </p>
        </div>
      )}

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

      {/* Items per page selector */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-xl font-bold">My Requests</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border p-1 rounded text-sm"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-600">requests per page</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <p className="text-sm text-gray-500">
            Showing {displayedRequests.length} of {filteredRequests.length}{" "}
            filtered requests
          </p>
        </div>
      </div>

      <table className="w-full bg-white rounded-lg shadow-md mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Title</th>
            <th className="p-2">Description</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Resolved At</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {displayedRequests.map((r) => (
            <tr key={r._id} className="border-b text-center hover:bg-gray-50">
              <td className="p-2">{r.title}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    r.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {r.status === "resolved" ? "✅ Resolved" : "❌ Pending"}
                </span>
              </td>
              <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="p-2">
                {r.resolvedAt ? (
                  new Date(r.resolvedAt).toLocaleString()
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="p-2">
                {r.status !== "resolved" && (
                  <button
                    onClick={() => markResolved(r._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    ✅ Mark Resolved
                  </button>
                )}
              </td>
            </tr>
          ))}
          {displayedRequests.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No requests found with current filters
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 bg-white p-4 rounded-lg shadow-md">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            « First
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ‹ Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? "bg-blue-800 text-white"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next ›
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Last »
          </button>

          <span className="text-gray-600 ml-4">
            Go to page:
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  goToPage(page);
                }
              }}
              className="ml-2 border p-1 rounded w-16 text-center"
            />
          </span>
        </div>
      )}
    </div>
  );
}
