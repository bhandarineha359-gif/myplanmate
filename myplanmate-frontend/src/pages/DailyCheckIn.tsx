// ============================================================
//  MyPlanMate – Daily Check-In Screen
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkinsApi } from "../api/client";
import PageLayout from "../components/PageLayout";

type YesNo = boolean | null;

export default function DailyCheckIn() {
  const navigate = useNavigate();

  const [attendedClass,       setAttendedClass]       = useState<YesNo>(null);
  const [wentToWork,          setWentToWork]           = useState<YesNo>(null);
  const [workedOnAssessment,  setWorkedOnAssessment]   = useState<YesNo>(null);
  const [hoursWorked,         setHoursWorked]          = useState("");
  const [success,             setSuccess]              = useState(false);
  const [error,               setError]                = useState("");
  const [loading,             setLoading]              = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attendedClass === null || wentToWork === null || workedOnAssessment === null) {
      setError("Please answer all questions."); return;
    }
    setError(""); setLoading(true);
    try {
      await checkinsApi.add({
        attended_class:       attendedClass,
        went_to_work:         wentToWork,
        worked_on_assessment: workedOnAssessment,
        hours_worked:         hoursWorked ? parseFloat(hoursWorked) : 0,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to submit check-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Daily Check-In">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
          ✅ Check-in submitted successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-5">
          <YesNoQ
            question="Did you attend your class today?"
            value={attendedClass}
            onChange={setAttendedClass}
          />
          <YesNoQ
            question="Did you go to work today?"
            value={wentToWork}
            onChange={setWentToWork}
          />
          <YesNoQ
            question="Did you work on your assessment today?"
            value={workedOnAssessment}
            onChange={setWorkedOnAssessment}
          />

          {/* Hours worked */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              How many hours did you work today?
            </label>
            <input
              type="number"
              min="0" max="24" step="0.5"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              placeholder="e.g. 5"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit Check-In"}
        </button>
      </form>
    </PageLayout>
  );
}

function YesNoQ({ question, value, onChange }: {
  question: string;
  value: YesNo;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{question}</p>
      <div className="flex gap-3">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              value === opt
                ? opt
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-red-500   text-white border-red-500"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {opt ? "YES" : "NO"}
          </button>
        ))}
      </div>
    </div>
  );
}
