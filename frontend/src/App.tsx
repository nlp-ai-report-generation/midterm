import { Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import Layout from "@/components/layout/Layout";
import RoleSelectPage from "@/pages/RoleSelectPage";
import DashboardPage from "@/app/dashboard/page";
import LecturesPage from "@/app/lectures/page";
import LectureDetailPage from "@/app/lectures/[date]/page";
import EDAPage from "@/pages/EDAPage";
import ChecklistPage from "@/pages/ChecklistPage";
import ExperimentsPage from "@/pages/ExperimentsPage";
import SettingsPage from "@/pages/SettingsPage";

function RequireRole({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  if (!role) return <Navigate to="/select-role" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/select-role" element={<RoleSelectPage />} />
      <Route
        element={
          <RequireRole>
            <Layout />
          </RequireRole>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lectures" element={<LecturesPage />} />
        <Route path="/lectures/:date" element={<LectureDetailPage />} />
        <Route path="/eda" element={<EDAPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
