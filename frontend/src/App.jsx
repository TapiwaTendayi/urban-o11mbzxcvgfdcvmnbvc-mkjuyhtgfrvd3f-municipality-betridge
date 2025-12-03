import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// NEW Layout (Step 2)
import DashboardLayout from "./components/SidebarLayout";

// Pages
import Home from "./pages/Home"; // NEW Step 1
import Login from "./pages/Login";
import Register from "./pages/Register";
import OfficeDashboard from "./pages/OfficeDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import UserManagement from "./pages/UserManagement";
import UpdatePassword from "./pages/UpdatePassword";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} /> {/* NEW Step 1 */}
          <Route path="/home" element={<Home />} /> {/* Optional */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Dashboards wrapped in NEW DashboardLayout */}
          <Route
            path="/dashboard/office"
            element={
              <DashboardLayout>
                <OfficeDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/supervisor"
            element={
              <DashboardLayout>
                <SupervisorDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/supervisor/users"
            element={
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/supervisor/password/:id"
            element={
              <DashboardLayout>
                <UpdatePassword />
              </DashboardLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
