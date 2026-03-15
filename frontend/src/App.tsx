import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DashboardPage from "@/app/dashboard/page";
import EDAPage from "@/app/eda/page";
import ExperimentsPage from "@/app/experiments/page";
import LecturesPage from "@/app/lectures/page";
import LectureDetailPage from "@/app/lectures/[date]/page";
import PreprocessingPage from "@/app/preprocessing/page";
import ReportsPage from "@/app/reports/page";
import SettingsPage from "@/app/settings/page";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <div className="app-shell lg:flex">
      <ScrollToTop />
      <Sidebar />
      <div className="relative z-10 min-w-0 flex-1 lg:pl-[var(--sidebar-width)]">
        <Header />
        <main className="px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/eda" element={<EDAPage />} />
              <Route path="/preprocessing" element={<PreprocessingPage />} />
              <Route path="/preprocessing/:date" element={<PreprocessingPage />} />
              <Route path="/lectures" element={<LecturesPage />} />
              <Route path="/lectures/:date" element={<LectureDetailPage />} />
              <Route path="/experiments" element={<ExperimentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
