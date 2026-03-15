import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "대시보드",
  "/lectures": "강의 평가",
  "/eda": "EDA 분석",
  "/settings": "설정",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/lectures/")) return "강의 상세";
  return PAGE_TITLES[pathname] ?? "대시보드";
}

export default function Header() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 60,
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E8EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
      }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#191F28",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      <Link
        to="/settings"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          color: "#8B95A1",
          transition: "color 0.15s",
        }}
        aria-label="설정"
      >
        <Settings size={20} />
      </Link>
    </header>
  );
}
