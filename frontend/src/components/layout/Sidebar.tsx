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
        <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    label: "EDA 분석",
    href: "/eda",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17V7l4 3 4-8 4 5 2-2v12H3z" fill="currentColor" opacity="0.3" />
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
        <circle cx="15" cy="5" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="15" cy="15" r="2.5" fill="currentColor" opacity="0.5" />
        <path d="M7 10h4M13 6l-2 4M13 14l-2-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "강의 평가",
    href: "/lectures",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2" width="14" height="16" rx="2" fill="currentColor" opacity="0.2" />
        <path d="M6 6h8M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "실험 비교",
    href: "/experiments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8 2v6L5 14v2h10v-2l-3-6V2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M5 14h10v2H5v-2z" fill="currentColor" opacity="0.3" />
        <path d="M7 2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "리포트 생성",
    href: "/reports",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 2h8l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" fill="currentColor" opacity="0.2" />
        <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col bg-surface border-r border-border"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L2 5v8l7 4 7-4V5L9 1z" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground leading-tight">
            강의 분석
          </h1>
          <p className="text-xs text-text-tertiary leading-tight">
            AI Report Generator
          </p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-border-light hover:text-foreground"
              )}
            >
              <span className={cn(isActive ? "text-primary" : "text-text-tertiary")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 정보 */}
      <div className="px-4 py-4 border-t border-border-light">
        <div className="bg-border-light rounded-xl p-3">
          <p className="text-xs font-medium text-text-secondary">데이터 범위</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            2026.02.02 ~ 02.27
          </p>
          <p className="text-xs text-text-tertiary">15개 강의 분석 완료</p>
        </div>
      </div>
    </aside>
  );
}
