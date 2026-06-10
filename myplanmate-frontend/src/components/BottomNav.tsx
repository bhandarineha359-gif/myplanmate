// ============================================================
//  MyPlanMate – BottomNav Component
// ============================================================
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, PlusCircle, Bell, CheckSquare } from "lucide-react";

const tabs = [
  { icon: Home,        label: "Home",     path: "/dashboard" },
  { icon: Calendar,    label: "Calendar", path: "/calendar"  },
  { icon: PlusCircle,  label: "Add",      path: "/add"       },
  { icon: Bell,        label: "Alerts",   path: "/notifications" },
  { icon: CheckSquare, label: "Check-in", path: "/checkin"   },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 max-w-md mx-auto z-50">
      {tabs.map(({ icon: Icon, label, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              active ? "text-blue-600" : "text-gray-400 hover:text-blue-400"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
