import { Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import RoleSelectPage from "@/pages/RoleSelectPage";
import DashboardPage from "@/app/dashboard/page";
import LecturesPage from "@/app/lectures/page";
import LectureDetailPage from "@/app/lectures/[date]/page";
import ValidationPage from "@/pages/ValidationPage";
import SettingsPage from "@/pages/SettingsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import PresentationPage from "@/pages/PresentationPage";


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
      <Route path="/presentation" element={<PresentationPage />} />
      <Route path="/about" element={<PresentationPage />} />
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
        <Route path="/analysis" element={<DashboardPage />} /> {/* TODO: AnalysisPage */}
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
