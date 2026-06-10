// ============================================================
//  MyPlanMate – PageLayout (wraps every authenticated screen)
// ============================================================
import BottomNav from "./BottomNav";

interface Props {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function PageLayout({ children, title, showBack, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      {title && (
        <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-40">
          {showBack && (
            <button
              onClick={onBack}
              className="text-blue-600 font-medium text-sm flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </header>
      )}

      {/* Page content – padded above bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
