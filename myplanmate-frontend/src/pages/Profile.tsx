// ============================================================
//  MyPlanMate – Profile / Logout Screen
// ============================================================
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/PageLayout";
import { User, LogOut, BookOpen, Briefcase } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <PageLayout title="My Profile" showBack onBack={() => navigate("/dashboard")}>
      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
        <div className="bg-blue-100 rounded-full p-5 mb-3">
          <User size={36} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
        <p className="text-gray-400 text-sm">{user?.email}</p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 bg-blue-50">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Account Details</p>
        </div>
        <Row icon={<BookOpen size={14} />} label="Course" value={user?.course_name || "—"} />
        <Row icon={<User      size={14} />} label="Student Type" value={user?.student_type || "—"} />
        <Row icon={<Briefcase size={14} />} label="Weekly Work Limit" value={`${user?.weekly_work_limit ?? 20} hrs`} />
      </div>

      {/* Privacy note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-6">
        <p className="text-xs text-blue-700">
          🔒 Your data is securely stored in the cloud using Supabase. It is only accessible to your account.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-red-600 active:scale-95 transition-all"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </PageLayout>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-50">
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm text-gray-500 flex-1">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
