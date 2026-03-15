"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 relative",
          isActive
            ? "bg-primary-light text-primary font-semibold"
            : "text-text-secondary hover:bg-[#F5F6F8] hover:text-foreground"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
        )}
        <span className={cn(isActive ? "text-primary" : "text-text-tertiary")}>
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col bg-surface border-r border-border"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-3.5 px-6 h-[76px] border-b border-border-light">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(255,107,0,0.3)]">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L2 5v8l7 4 7-4V5L9 1z" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="text-[15px] font-extrabold text-foreground leading-tight tracking-tight">
            강의 분석
          </h1>
          <p className="text-xs text-text-tertiary leading-tight mt-0.5">
            AI Report Generator
          </p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-5 px-4 space-y-1">
        {NAV_ITEMS.map(renderNavItem)}
      </nav>

      {/* 구분선 */}
      <div className="mx-4 border-t border-border-light" />

      {/* 설정 */}
      <div className="px-4 py-3">
        {renderNavItem(SETTINGS_ITEM)}
      </div>

      {/* 하단 정보 - 미니 스탯 카드 */}
      <div className="px-4 pb-5">
        <div className="bg-[#F7F8FA] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-tertiary">분석 강의</p>
            <p className="text-lg font-bold text-foreground leading-none">15</p>
          </div>
          <div className="h-px bg-border-light" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-tertiary">데이터 기간</p>
            <p className="text-xs font-semibold text-text-secondary leading-none">
              02.02 ~ 02.27
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
