// ============================================================
//  MyPlanMate – Calendar Screen
// ============================================================
import { useState } from "react";
import { calendarApi, type CalendarEvent } from "../api/client";
import PageLayout from "../components/PageLayout";
import { Loader2, BookOpen, Briefcase, FileText } from "lucide-react";

// Returns all day numbers in the displayed month grid
function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  return grid;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarScreen() {
  const today = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [selected, setSelected] = useState<string>("");
  const [events,   setEvents]   = useState<CalendarEvent[]>([]);
  const [loading,  setLoading]  = useState(false);

  const grid = buildCalendarGrid(year, month);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(""); setEvents([]);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(""); setEvents([]);
  };

  const selectDay = async (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelected(dateStr);
    setLoading(true);
    try {
      const res = await calendarApi.getByDate(dateStr);
      setEvents(res.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    class:      { icon: <BookOpen  size={14} />, color: "bg-blue-50   text-blue-700   border-blue-200"   },
    shift:      { icon: <Briefcase size={14} />, color: "bg-green-50  text-green-700  border-green-200"  },
    assessment: { icon: <FileText  size={14} />, color: "bg-orange-50 text-orange-700 border-orange-200" },
  };

  return (
    <PageLayout title="Calendar">
      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 mb-4 border border-gray-100 shadow-sm">
        <button onClick={prevMonth} className="text-blue-600 font-bold text-lg px-2">‹</button>
        <span className="font-semibold text-gray-800">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="text-blue-600 font-bold text-lg px-2">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-5">
        {grid.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selected;
          return (
            <button
              key={dateStr}
              onClick={() => selectDay(day)}
              className={`aspect-square rounded-xl text-sm font-medium transition-all
                ${isSelected ? "bg-blue-600 text-white shadow-md" :
                  isToday    ? "bg-blue-100 text-blue-700 font-bold" :
                               "bg-white text-gray-700 hover:bg-gray-100"}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Events for selected day */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-700">
              {new Date(selected + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-blue-400" size={24} />
            </div>
          )}

          {!loading && events.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">No schedules for this date</p>
          )}

          {!loading && events.map((ev) => {
            const cfg = typeConfig[ev.type];
            return (
              <div key={ev.id} className={`flex items-center gap-3 px-4 py-3 border-t border-gray-50`}>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg border ${cfg.color}`}>
                  {cfg.icon} {ev.type}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                  <p className="text-xs text-gray-400">
                    {ev.time}{ev.duration_hours ? ` · ${ev.duration_hours}h` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
