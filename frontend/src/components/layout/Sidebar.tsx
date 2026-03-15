import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "대시보드",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "EDA 분석",
    href: "/eda",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17V7l4 3 4-8 4 5 2-2v12H3z" fill="currentColor" />
        <path d="M3 17V7l4 3 4-8 4 5 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    label: "전처리",
    href: "/preprocessing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="5" cy="10" r="2.5" fill="currentColor" />
        <circle cx="15" cy="5" r="2.5" fill="currentColor" />
        <circle cx="15" cy="15" r="2.5" fill="currentColor" />
        <path d="M7 10h4M13 6l-2 4M13 14l-2-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "강의 평가",
    href: "/lectures",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2" width="14" height="16" rx="2" fill="currentColor" />
        <path d="M6 6h8M6 9h6M6 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "실험 비교",
    href: "/experiments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8 2v6L5 14v2h10v-2l-3-6V2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M5 14h10v2H5v-2z" fill="currentColor" />
        <path d="M7 2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "리포트 생성",
    href: "/reports",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 2h8l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" fill="currentColor" />
        <path d="M12 2v4h4" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M7 10h6M7 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SETTINGS_ITEM: NavItem = {
  label: "설정",
  href: "/settings",
  icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.2 12.2a1.2 1.2 0 00.24 1.32l.04.04a1.46 1.46 0 11-2.06 2.06l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.12a1.46 1.46 0 11-2.92 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.46 1.46 0 11-2.06-2.06l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.73h-.12a1.46 1.46 0 110-2.92h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.46 1.46 0 112.06-2.06l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.73-1.1v-.12a1.46 1.46 0 012.92 0v.06a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.46 1.46 0 112.06 2.06l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.73h.12a1.46 1.46 0 010 2.92h-.06a1.2 1.2 0 00-1.1.73z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

export default function Sidebar() {
  const { pathname } = useLocation();

  const renderNavItem = (item: NavItem) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold",
          isActive
            ? "bg-primary-soft text-primary shadow-[0_10px_24px_rgba(49,130,246,0.12)]"
            : "text-text-secondary hover:bg-white hover:text-foreground"
        )}
      >
        {isActive && (
          <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-primary" />
        )}
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl",
            isActive
              ? "bg-white text-primary"
              : "bg-white/80 text-text-tertiary"
          )}
        >
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="surface-card sticky top-0 z-30 mx-4 mt-4 flex h-fit flex-col overflow-hidden border-none lg:fixed lg:inset-y-4 lg:left-4 lg:m-0 lg:w-[calc(var(--sidebar-width)-32px)]"
    >
      <div className="flex items-center gap-3 border-b border-divider px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5aa5ff,#3182f6)] shadow-[0_12px_26px_rgba(49,130,246,0.28)]">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L2 5v8l7 4 7-4V5L9 1z" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="text-[17px] font-bold leading-tight text-foreground">
            Lecture Insight
          </h1>
          <p className="mt-0.5 text-[13px] leading-tight text-text-tertiary">
            실제 분석 결과 기반 대시보드
          </p>
        </div>
      </div>

      <nav className="grid gap-1.5 px-4 py-4 lg:flex-1">
        {NAV_ITEMS.map(renderNavItem)}
      </nav>

      <div className="mx-4 hidden border-t border-divider lg:block" />

      <div className="px-4 py-3">
        {renderNavItem(SETTINGS_ITEM)}
      </div>

      <div className="px-4 pb-4 lg:pb-5">
        <div className="rounded-[22px] border border-[rgba(49,130,246,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,246,255,0.78))] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text-tertiary">
              분석 상태
            </p>
            <span className="chip h-7 border-transparent bg-white text-primary">
              live
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[13px] text-text-tertiary">원본 강의</p>
                <p className="text-[22px] font-bold tracking-tight text-foreground">15개</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-text-tertiary">기간</p>
                <p className="text-[15px] font-semibold text-text-secondary">02.02-02.27</p>
              </div>
            </div>
            <div className="h-px bg-divider" />
            <p className="text-[13px] leading-5 text-text-secondary">
              실험 결과를 `public/data`에 반영해 정적 화면과 실제 평가를 맞춥니다.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
