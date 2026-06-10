// ============================================================
//  MyPlanMate – Login Screen
// ============================================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { BookOpen } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      const user = await authApi.login(email, password);
      login(user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto px-6">
      {/* Back */}
      <button onClick={() => navigate("/")} className="text-blue-600 font-medium mt-6 text-sm self-start">
        ← Back
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center mt-8 mb-8">
        <div className="bg-blue-600 rounded-2xl p-3 mb-3">
          <BookOpen size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Log in to your account</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome back!</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base mt-2 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Not registered yet?{" "}
        <Link to="/signup" className="text-blue-600 font-semibold">
          Sign up here
        </Link>
      </p>
    </div>
  );
}
