// ============================================================
//  MyPlanMate – Add Class Screen
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classesApi } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function AddClass() {
  const navigate = useNavigate();

  const [className, setClassName] = useState("");
  const [date,      setDate]      = useState("");
  const [time,      setTime]      = useState("");
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !date || !time) { setError("All fields are required."); return; }
    setError(""); setLoading(true);
    try {
      await classesApi.add({ class_name: className, date, time });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save class.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Add Class" showBack onBack={() => navigate("/add")}>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
          ✅ Class saved successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
          <FormField label="Class Name" value={className} onChange={setClassName} placeholder="e.g. Database Systems" />
          <FormField label="Date" type="date" value={date} onChange={setDate} />
          <FormField label="Time" type="time" value={time} onChange={setTime} />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save Class"}
        </button>
      </form>
    </PageLayout>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
