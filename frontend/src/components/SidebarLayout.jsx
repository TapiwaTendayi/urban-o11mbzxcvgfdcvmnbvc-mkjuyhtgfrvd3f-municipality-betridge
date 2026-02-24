import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);


  useEffect(() => {
    
  }, [user]);

 
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-5 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-blue-700">ITSolve</h1>

          <nav className="space-y-2">
            <Link
              to={
                user?.role === "supervisor"
                  ? "/dashboard/supervisor"
                  : user?.role === "student"
                  ? "/dashboard/student"
                  : "/dashboard/office"
              }
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
            >
              🏠 Dashboard
            </Link>

            {user?.role === "supervisor" && (
              <>
                <Link
                  to="/supervisor/users"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                >
                  👥 Manage Users
                </Link>
              </>
            )}

            {user?.role === "student" && (
              <Link
                to="/dashboard/student"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
              >
                🎓 Student Dashboard
              </Link>
            )}

            {user?.role === "office" && (
              <Link
                to="/dashboard/office"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
              >
                🏢 Office Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
