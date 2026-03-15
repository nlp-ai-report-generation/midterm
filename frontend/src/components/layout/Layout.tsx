import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[#FF6B00] focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
      >
        본문으로 건너뛰기
      </a>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 240 }}>
        <Header />
        <main id="main" style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
