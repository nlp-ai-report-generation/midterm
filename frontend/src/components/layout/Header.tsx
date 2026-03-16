import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "대시보드",
  "/lectures": "강의 평가",
  "/eda": "데이터 분석",
  "/experiments": "실험 기록",
  "/settings": "설정",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/lectures/")) return "강의 상세";
  return PAGE_TITLES[pathname] ?? "대시보드";
}

interface HeaderProps {
  isMobile?: boolean;
}

export default function Header({ isMobile }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, instructorName } = useRole();
  const title = getPageTitle(pathname);

  const roleBadgeText =
    role === "operator"
      ? "운영자"
      : role === "instructor"
        ? `강사: ${instructorName || "미설정"}`
        : null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 60,
        background: "var(--surface)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 40px",
      }}
    >
      <h1
        style={{
          fontSize: isMobile ? 18 : 20,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {roleBadgeText && (
            <button
              onClick={() => navigate("/select-role")}
              className="text-caption"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
              }}
            >
              {roleBadgeText}
            </button>
          )}
          <Link
            to="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              color: "var(--text-tertiary)",
              transition: "color 0.15s",
            }}
            aria-label="설정"
          >
            <Settings size={20} />
          </Link>
        </div>
      )}
    </header>
  );
}
