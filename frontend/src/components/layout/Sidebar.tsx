import { NavLink } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import {
  Home,
  FileText,
  BarChart2,
  List,
  GitCompare,
  GitCompareArrows,
  TrendingUp,
  Layers,
  ShieldCheck,
  Settings,
  Link2,
  Info,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  labelTo?: string;
  items: NavItem[];
}

const OPERATOR_NAV: NavGroup[] = [
  {
    items: [
      { to: "/dashboard", label: "홈", icon: Home },
      { to: "/lectures", label: "강의 목록", icon: FileText },
    ],
  },
  {
    label: "분석",
    items: [
      { to: "/eda", label: "데이터 분석", icon: BarChart2 },
      { to: "/trends", label: "점수 추이", icon: TrendingUp },
      { to: "/compare", label: "강의 비교", icon: GitCompareArrows },
      { to: "/items", label: "항목별 분석", icon: Layers },
    ],
  },
  {
    label: "검증",
    items: [
      { to: "/experiments", label: "모델 비교", icon: GitCompare },
      { to: "/validation", label: "신뢰성 검증", icon: ShieldCheck },
      { to: "/checklist", label: "평가 기준", icon: List },
    ],
  },
  {
    items: [
      { to: "/settings", label: "설정", icon: Settings },
      { to: "/integrations", label: "연동", icon: Link2 },
      { to: "/about", label: "소개", icon: Info },
    ],
  },
];

const INSTRUCTOR_NAV: NavGroup[] = [
  {
    items: [
      { to: "/dashboard", label: "홈", icon: Home },
      { to: "/lectures", label: "내 강의", icon: FileText },
      { to: "/trends", label: "점수 추이", icon: TrendingUp },
    ],
  },
  {
    items: [
      { to: "/settings", label: "설정", icon: Settings },
      { to: "/about", label: "소개", icon: Info },
    ],
  },
];

export default function Sidebar() {
  const { isOperator } = useRole();
  const navGroups = isOperator ? OPERATOR_NAV : INSTRUCTOR_NAV;

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
        borderRight: "1px solid var(--border)",
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
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--surface)",
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          LA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            강의 분석
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
            }}
          >
            {isOperator ? "운영자 모드" : "강사 모드"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="메인 네비게이션" style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: 8 }}>
            {group.label && (
              <div
                title={group.label === "분석" ? "강의 데이터를 다양한 관점에서 살펴볼 수 있어요" : group.label === "검증" ? "AI 평가를 믿을 수 있는지 확인해요" : ""}
                style={{
                  padding: "16px 12px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "default",
                }}
              >
                {group.label}
              </div>
            )}
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((item) => (
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
          </div>
        ))}
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
