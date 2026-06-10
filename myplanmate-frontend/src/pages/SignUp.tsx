// ============================================================
//  MyPlanMate – Sign Up Screen
// ============================================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    course_name: "",
    student_type: "Domestic",
    weekly_work_limit: 20,
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Username, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await authApi.register(form);
      login(user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto px-6 pb-10">
      <button onClick={() => navigate("/login")} className="text-blue-600 font-medium mt-6 text-sm self-start">
        ← Back
      </button>

      <div className="mt-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">Join MyPlanMate today</p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        {/* Account */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Account Details</p>
          <div className="flex flex-col gap-3">
            <Field label="Username" value={form.username} onChange={(v) => update("username", v)} placeholder="e.g. jane_student" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="student@university.edu" />
            <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="At least 6 characters" />
          </div>
        </div>

        {/* Personal details */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Personal Details</p>
          <div className="flex flex-col gap-3">
            <Field label="Course Name" value={form.course_name} onChange={(v) => update("course_name", v)} placeholder="e.g. Bachelor of IT" />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Student Type</label>
              <select
                value={form.student_type}
                onChange={(e) => update("student_type", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>Domestic</option>
                <option>International</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Weekly Work Limit (hours)
              </label>
              <input
                type="number"
                min={1} max={48}
                value={form.weekly_work_limit}
                onChange={(e) => update("weekly_work_limit", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">International students: typically 24 hrs/week on student visa</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-4">
        Already registered?{" "}
        <Link to="/login" className="text-blue-600 font-semibold">Log in</Link>
      </p>
    </div>
  );
}

// Reusable input field helper
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
