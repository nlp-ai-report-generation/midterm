import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Search,
  ClipboardList,
  FlaskConical,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { to: "/lectures", label: "강의 평가", icon: BookOpen },
  { to: "/eda", label: "데이터 분석", icon: Search },
  { to: "/checklist", label: "평가 기준", icon: ClipboardList },
  { to: "/experiments", label: "모델 비교", icon: FlaskConical },
  { to: "/settings", label: "설정", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside
      aria-label="사이드바"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        zIndex: 30,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--surface)",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          L
        </div>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          강의 분석
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="메인 네비게이션" style={{ flex: 1, padding: "0 12px" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--primary-light)" : "transparent",
                  textDecoration: "none",
                  transition: "color 0.15s, background 0.15s",
                })}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "20px 24px",
          fontSize: 12,
          color: "var(--text-tertiary)",
          letterSpacing: "-0.02em",
        }}
      >
        15개 강의 · 2026.02
      </div>
    </aside>
  );
}
