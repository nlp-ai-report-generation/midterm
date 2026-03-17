import { Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import RoleSelectPage from "@/pages/RoleSelectPage";
import DashboardPage from "@/app/dashboard/page";
import LecturesPage from "@/app/lectures/page";
import LectureDetailPage from "@/app/lectures/[date]/page";
import EDAPage from "@/pages/EDAPage";
import ChecklistPage from "@/pages/ChecklistPage";
import ExperimentsPage from "@/pages/ExperimentsPage";
import ComparePage from "@/pages/ComparePage";
import TrendsPage from "@/pages/TrendsPage";
import ItemAnalysisPage from "@/pages/ItemAnalysisPage";
import SettingsPage from "@/pages/SettingsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import AboutPage from "@/pages/AboutPage";
import ValidationPage from "@/pages/ValidationPage";

function RequireRole({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const { user, loading } = useAuth();

  if (loading) return null;

  // Allow access if user is logged in OR has a guest role set
  if (!role && !user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage />} />
      <Route
        element={
          <RequireRole>
            <Layout />
          </RequireRole>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lectures" element={<LecturesPage />} />
        <Route path="/lectures/:date" element={<LectureDetailPage />} />
        <Route path="/eda" element={<EDAPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/items" element={<ItemAnalysisPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
