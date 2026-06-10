// ============================================================
//  MyPlanMate – Add Assessment Screen
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentsApi } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function AddAssessment() {
  const navigate = useNavigate();

  const [title,   setTitle]   = useState("");
  const [dueDate, setDueDate] = useState("");
  const [time,    setTime]    = useState("");
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !time) { setError("All fields are required."); return; }
    setError(""); setLoading(true);
    try {
      await assessmentsApi.add({ assessment_title: title, due_date: dueDate, time });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save assessment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Add Assessment" showBack onBack={() => navigate("/add")}>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
          ✅ Assessment saved successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Assessment Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Assignment 3 – Vibe Coding"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Due Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading || success}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60">
          {loading ? "Saving…" : "Save Assessment"}
        </button>
      </form>
    </PageLayout>
  );
}
