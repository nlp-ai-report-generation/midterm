import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "대시보드",
  "/lectures": "강의 평가",
  "/eda": "데이터 분석",
  "/checklist": "평가 기준",
  "/experiments": "모델 비교",
  "/compare": "강의 비교",
  "/trends": "점수 추이",
  "/items": "항목별 분석",
  "/settings": "설정",
  "/integrations": "연동 설정",
  "/presentation": "프로젝트 소개",
  "/about": "프로젝트 소개",
};

function getPageTitle(pathname: string): string {
  if (pathname.endsWith("/simulation/live/transcript")) return "실시간 원문 브라우저";
  if (pathname.endsWith("/simulation/live")) return "실시간 시뮬레이션";
  if (pathname.endsWith("/simulation/transcript")) return "실시간 원문 브라우저";
  if (pathname.endsWith("/simulation")) return "수강자 반응 요약";
  if (pathname.startsWith("/lectures/")) return "강의 상세";
  return PAGE_TITLES[pathname] ?? "대시보드";
}

function truncateEmail(email: string, max = 20): string {
  if (email.length <= max) return email;
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, max) + "...";
  const keep = Math.max(3, max - domain.length - 4);
  return local.slice(0, keep) + "...@" + domain;
}

interface HeaderProps {
  isMobile?: boolean;
}

export default function Header({ isMobile }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, instructorName } = useRole();
  const { user, signOut } = useAuth();
  const title = getPageTitle(pathname);

  const isLoggedIn = !!user;

  const badgeText = isLoggedIn
    ? truncateEmail(user.email ?? "사용자")
    : role === "operator"
      ? "운영자"
      : role === "instructor"
        ? `강사: ${instructorName || "미설정"}`
        : null;

  const handleBadgeClick = () => {
    if (isLoggedIn) {
      navigate("/settings");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
        {badgeText && (
          <button
            onClick={handleBadgeClick}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: isMobile ? 12 : 13,
              color: "var(--text-muted)",
              fontWeight: 600,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            {badgeText}
          </button>
        )}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: isMobile ? 12 : 13,
              color: "var(--text-tertiary)",
              fontWeight: 500,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger, #e53e3e)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            로그아웃
          </button>
        )}
        {!isMobile && (
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
        )}
      </div>
    </header>
  );
}
