import { NavLink } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import {
  Home,
  FileText,
  BarChart2,
  ShieldCheck,
  Settings,
  Link2,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: "/dashboard", label: "홈", icon: Home },
      { to: "/lectures", label: "강의", icon: FileText },
    ],
  },
  {
    label: "도구",
    items: [
      { to: "/analysis", label: "분석", icon: BarChart2 },
      { to: "/validation", label: "검증", icon: ShieldCheck },
    ],
  },
  {
    label: "설정",
    items: [
      { to: "/settings", label: "설정", icon: Settings },
      { to: "/integrations", label: "연동", icon: Link2 },
    ],
  },
];

export default function Sidebar() {
  const { isOperator } = useRole();
  const navGroups = NAV_GROUPS;

  return (
    <aside
      aria-label="사이드바"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "#F5F5F5",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 30,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "32px 28px 28px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(0,0,0,0.85)",
            lineHeight: 1.2,
          }}
        >
          강의 분석
        </span>
        <span
          style={{
            fontSize: 11,
            color: "rgba(0,0,0,0.25)",
          }}
        >
          {isOperator ? "운영자 모드" : "강사 모드"}
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="메인 네비게이션" style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: 8 }}>
            {group.label && (
              <div
                style={{
                  padding: "16px 8px 6px",
                  fontSize: 11,
                  fontWeight: 590,
                  color: "rgba(0,0,0,0.25)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "default",
                }}
              >
                {group.label}
              </div>
            )}
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 1 }}>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "4px 8px",
                      borderRadius: 5,
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: "rgba(0,0,0,0.85)",
                      background: isActive ? "rgba(0,0,0,0.05)" : "transparent",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    })}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
