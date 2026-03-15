import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DashboardPage from "@/app/dashboard/page";
import LecturesPage from "@/app/lectures/page";
import LectureDetailPage from "@/app/lectures/[date]/page";
import EDAPage from "@/app/eda/page";
import SettingsPage from "@/app/settings/page";
import ExperimentsPage from "@/app/experiments/page";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lectures" element={<LecturesPage />} />
        <Route path="/lectures/:date" element={<LectureDetailPage />} />
        <Route path="/eda" element={<EDAPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
