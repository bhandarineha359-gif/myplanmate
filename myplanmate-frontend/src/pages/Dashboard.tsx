// ============================================================
//  MyPlanMate – Dashboard Screen
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardApi, type DashboardData } from "../api/client";
import PageLayout from "../components/PageLayout";
import { User, BookOpen, Briefcase, FileText, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(() => setError("Could not load dashboard. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const isEmpty =
    data &&
    data.upcoming_classes.length === 0 &&
    data.upcoming_shifts.length === 0 &&
    data.upcoming_assessments.length === 0;

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-gray-500 text-sm">Hello,</p>
          <h1 className="text-xl font-bold text-gray-800">{user?.username} 👋</h1>
          <p className="text-gray-400 text-xs">Welcome to MyPlanMate</p>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-100 p-3 rounded-full text-blue-600 hover:bg-blue-200 transition"
        >
          <User size={22} />
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {!loading && !error && isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600 font-semibold">You haven't added anything yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Start by adding your schedule using the + button below
          </p>
        </div>
      )}

      {!loading && data && !isEmpty && (
        <div className="flex flex-col gap-5">
          {/* Upcoming Classes */}
          {data.upcoming_classes.length > 0 && (
            <Section title="Upcoming Classes" icon={<BookOpen size={16} />} color="blue">
              {data.upcoming_classes.map((c) => (
                <Card key={c.id} title={c.class_name} sub={`${c.date} at ${c.time}`} />
              ))}
            </Section>
          )}

          {/* Upcoming Work Shifts */}
          {data.upcoming_shifts.length > 0 && (
            <Section title="Upcoming Work Shifts" icon={<Briefcase size={16} />} color="green">
              {data.upcoming_shifts.map((s) => (
                <Card key={s.id} title={s.workplace_name} sub={`${s.date} at ${s.time} · ${s.duration_hours}h`} />
              ))}
            </Section>
          )}

          {/* Upcoming Assessments */}
          {data.upcoming_assessments.length > 0 && (
            <Section title="Upcoming Assessments" icon={<FileText size={16} />} color="orange">
              {data.upcoming_assessments.map((a) => (
                <Card key={a.id} title={a.assessment_title} sub={`Due ${a.due_date} at ${a.time}`} />
              ))}
            </Section>
          )}
        </div>
      )}
    </PageLayout>
  );
}

function Section({ title, icon, color, children }: {
  title: string; icon: React.ReactNode;
  color: "blue" | "green" | "orange"; children: React.ReactNode;
}) {
  const colors = {
    blue:   "text-blue-600 bg-blue-50",
    green:  "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 ${colors[color]}`}>
        {icon}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Card({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
