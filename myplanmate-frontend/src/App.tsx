// ============================================================
//  MyPlanMate – App.tsx (Router + Auth Provider)
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome       from "./pages/Welcome";
import Login         from "./pages/Login";
import SignUp        from "./pages/SignUp";
import Dashboard     from "./pages/Dashboard";
import AddSchedule   from "./pages/AddSchedule";
import AddClass      from "./pages/AddClass";
import AddWorkShift  from "./pages/AddWorkShift";
import AddAssessment from "./pages/AddAssessment";
import CalendarScreen from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import DailyCheckIn  from "./pages/DailyCheckIn";
import Profile       from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<Welcome />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected – require login */}
          <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add"          element={<ProtectedRoute><AddSchedule /></ProtectedRoute>} />
          <Route path="/add/class"    element={<ProtectedRoute><AddClass /></ProtectedRoute>} />
          <Route path="/add/shift"    element={<ProtectedRoute><AddWorkShift /></ProtectedRoute>} />
          <Route path="/add/assessment" element={<ProtectedRoute><AddAssessment /></ProtectedRoute>} />
          <Route path="/calendar"     element={<ProtectedRoute><CalendarScreen /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/checkin"      element={<ProtectedRoute><DailyCheckIn /></ProtectedRoute>} />
          <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
