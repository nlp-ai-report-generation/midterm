import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileTabBar from "./MobileTabBar";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <a
        href="#main"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
        onFocus={(e) => {
          const el = e.currentTarget;
          el.style.width = "auto";
          el.style.height = "auto";
          el.style.clip = "auto";
          el.style.overflow = "visible";
          el.style.zIndex = "50";
          el.style.position = "fixed";
          el.style.top = "16px";
          el.style.left = "16px";
          el.style.padding = "8px 16px";
          el.style.background = "var(--primary)";
          el.style.color = "white";
          el.style.borderRadius = "var(--radius-inner)";
          el.style.fontSize = "14px";
          el.style.fontWeight = "600";
        }}
        onBlur={(e) => {
          const el = e.currentTarget;
          el.style.width = "1px";
          el.style.height = "1px";
          el.style.clip = "rect(0,0,0,0)";
          el.style.overflow = "hidden";
        }}
      >
        본문으로 건너뛰기
      </a>

      {!isMobile && <Sidebar />}

      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : "var(--sidebar-width)",
          paddingBottom: isMobile ? 72 : 0,
        }}
      >
        <Header isMobile={isMobile} />
        <main
          id="main"
          style={{
            padding: isMobile ? "24px 16px" : "32px 40px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <Outlet />
        </main>
      </div>

      {isMobile && <MobileTabBar />}
    </div>
  );
}
