import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 240 }}>
        <Header />
        <main style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
