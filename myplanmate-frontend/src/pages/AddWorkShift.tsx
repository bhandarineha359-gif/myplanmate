// ============================================================
//  MyPlanMate – Add Work Shift Screen
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shiftsApi } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function AddWorkShift() {
  const navigate = useNavigate();

  const [workplace,      setWorkplace]      = useState("");
  const [date,           setDate]           = useState("");
  const [time,           setTime]           = useState("");
  const [durationHours,  setDurationHours]  = useState("");
  const [success,        setSuccess]        = useState(false);
  const [error,          setError]          = useState("");
  const [loading,        setLoading]        = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workplace || !date || !time || !durationHours) {
      setError("All fields are required."); return;
    }
    setError(""); setLoading(true);
    try {
      await shiftsApi.add({
        workplace_name: workplace,
        date, time,
        duration_hours: parseFloat(durationHours),
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save work shift.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Add Work Shift" showBack onBack={() => navigate("/add")}>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
          ✅ Work shift saved successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
          <Field label="Workplace Name" value={workplace} onChange={setWorkplace} placeholder="e.g. Woolworths" />
          <Field label="Date" type="date" value={date} onChange={setDate} />
          <Field label="Start Time" type="time" value={time} onChange={setTime} />
          <Field label="Duration (hours)" type="number" value={durationHours} onChange={setDurationHours} placeholder="e.g. 4" />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save Work Shift"}
        </button>
      </form>
    </PageLayout>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} min={type === "number" ? "0.5" : undefined} step={type === "number" ? "0.5" : undefined}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
