import { Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import RoleSelectPage from "@/pages/RoleSelectPage";
import DashboardPage from "@/app/dashboard/page";
import LecturesPage from "@/app/lectures/page";
import LectureDetailPage from "@/app/lectures/[date]/page";
import ValidationPage from "@/pages/ValidationPage";
import LectureSimulationPage from "@/pages/LectureSimulationPage";
import LectureSimulationLivePage from "@/pages/LectureSimulationLivePage";


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
        <Route path="/lectures/:date/simulation" element={<LectureSimulationPage />} />
        <Route path="/lectures/:date/simulation/live" element={<LectureSimulationLivePage />} />
        <Route path="/analysis" element={<DashboardPage />} /> {/* TODO: AnalysisPage */}
        <Route path="/validation" element={<ValidationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
