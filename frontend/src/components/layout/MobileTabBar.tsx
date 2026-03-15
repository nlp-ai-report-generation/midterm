import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Search,
  FlaskConical,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface TabItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const TAB_ITEMS: TabItem[] = [
  { to: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { to: "/lectures", label: "강의 평가", icon: BookOpen },
  { to: "/eda", label: "분석", icon: Search },
  { to: "/experiments", label: "실험", icon: FlaskConical },
  { to: "/settings", label: "설정", icon: Settings },
];

export default function MobileTabBar() {
  return (
    <nav
      aria-label="모바일 네비게이션"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "var(--surface)",
        boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 40,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TAB_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "6px 12px",
            fontSize: 10,
            fontWeight: 600,
            color: isActive ? "var(--primary)" : "var(--text-muted)",
            textDecoration: "none",
            transition: "color 0.15s",
          })}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
