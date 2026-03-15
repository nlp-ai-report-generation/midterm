import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Search,
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
  { to: "/eda", label: "EDA 분석", icon: Search },
  { to: "/settings", label: "설정", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        background: "#FFFFFF",
        borderRight: "1px solid #E5E8EB",
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
            background: "#FF6B00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
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
            color: "#191F28",
            letterSpacing: "-0.02em",
          }}
        >
          강의 분석
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
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
                  color: isActive ? "#FF6B00" : "#6B7684",
                  background: isActive ? "#FFF4EB" : "transparent",
                  borderLeft: isActive ? "3px solid #FF6B00" : "3px solid transparent",
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
          borderTop: "1px solid #E5E8EB",
          fontSize: 12,
          color: "#8B95A1",
          letterSpacing: "-0.02em",
        }}
      >
        15개 강의 · 2026.02
      </div>
    </aside>
  );
}
