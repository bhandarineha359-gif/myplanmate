// ============================================================
//  MyPlanMate – Welcome Screen
// ============================================================
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-between px-6 py-16 max-w-md mx-auto">
      {/* Logo + title */}
      <div className="flex flex-col items-center gap-4 mt-12">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <BookOpen size={48} className="text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">MyPlanMate</h1>
        <p className="text-blue-100 text-lg font-medium text-center">
          Plan Smarter, Stay Organised
        </p>
        <p className="text-blue-200 text-sm text-center">
          Manage your time in one place
        </p>
      </div>

      {/* CTA */}
      <div className="w-full flex flex-col gap-3 mb-8">
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl text-lg shadow-lg hover:bg-blue-50 active:scale-95 transition-all"
        >
          Get Started
        </button>
        <p className="text-blue-200 text-xs text-center">
          🔒 Your data is securely stored in the cloud
        </p>
      </div>
    </div>
  );
}
