// ============================================================
//  MyPlanMate – Notifications Screen
// ============================================================
import { useEffect, useState } from "react";
import { dashboardApi } from "../api/client";
import PageLayout from "../components/PageLayout";
import { Loader2, Bell } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    dashboardApi.get()
      .then((d) => setNotifications(d.notifications))
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  // Choose card colour based on emoji prefix
  const cardColor = (msg: string) => {
    if (msg.startsWith("🚨")) return "bg-red-50   border-red-200   text-red-800";
    if (msg.startsWith("⚠️")) return "bg-orange-50 border-orange-200 text-orange-800";
    if (msg.startsWith("✅")) return "bg-green-50  border-green-200  text-green-800";
    return                          "bg-blue-50   border-blue-200   text-blue-800";
  };

  return (
    <PageLayout title="Notifications">
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-400" size={28} />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {notifications.map((n, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${cardColor(n)}`}>
              <Bell size={16} className="mt-0.5 shrink-0" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
