import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "office",
    office: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const id = toast.loading("Creating user...");
      await axios.post("http://localhost:5000/api/auth/register", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.dismiss(id);
      toast.success("User created successfully");
      setForm({
        name: "",
        email: "",
        role: "office",
        office: "",
        password: "",
        confirmPassword: "",
      });
      fetchUsers();
    } catch (err) {
      console.error("Create user error:", err.response?.data);
      toast.error(err.response?.data?.message || "Error creating user");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const idToast = toast.loading("Deleting user...");
      await axios.delete(`http://localhost:5000/api/auth/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.dismiss(idToast);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.dismiss();
      console.error("Delete error:", err.response?.data);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Manage Users</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User Form */}
        <form
          onSubmit={handleCreateUser}
          className="bg-white p-4 rounded shadow w-full"
        >
          <h2 className="font-bold text-lg mb-3">Create New User</h2>

          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <select
            className="border p-2 w-full mb-2 rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="office">Office</option>
            <option value="student">Student</option>
            <option value="supervisor">Supervisor</option>
          </select>

          {(form.role === "office" || form.role === "supervisor") && (
            <input
              className="border p-2 w-full mb-2 rounded"
              placeholder="Office name"
              value={form.office}
              onChange={(e) => setForm({ ...form, office: e.target.value })}
            />
          )}

          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show password
          </label>

          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Create User
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/supervisor")}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Back
            </button>
          </div>
        </form>

        {/* Users List */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Existing Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Office</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2">{u.office || "-"}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/supervisor/password/${u._id}`)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
