// ============================================================
//  MyPlanMate – Add Schedule Hub
// ============================================================
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { BookOpen, Briefcase, FileText } from "lucide-react";

const options = [
  { label: "Add Class",       icon: BookOpen,  path: "/add/class",       color: "bg-blue-50 text-blue-600  border-blue-200"  },
  { label: "Add Work Shift",  icon: Briefcase, path: "/add/shift",       color: "bg-green-50 text-green-600 border-green-200" },
  { label: "Add Assessment",  icon: FileText,  path: "/add/assessment",  color: "bg-orange-50 text-orange-600 border-orange-200" },
];

export default function AddSchedule() {
  const navigate = useNavigate();

  return (
    <PageLayout title="Add Your Schedule">
      <p className="text-gray-500 text-sm mb-5">What would you like to add?</p>

      <div className="flex flex-col gap-4">
        {options.map(({ label, icon: Icon, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-4 px-5 py-5 rounded-2xl border shadow-sm hover:shadow-md active:scale-95 transition-all ${color} w-full text-left`}
          >
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Icon size={24} />
            </div>
            <span className="font-semibold text-base">{label}</span>
            <span className="ml-auto text-2xl">+</span>
          </button>
        ))}
      </div>
    </PageLayout>
  );
}
