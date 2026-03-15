"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "대시보드",
    description: "15개 강의 평가 결과를 한눈에 확인하세요",
  },
  "/eda": {
    title: "EDA 분석",
    description: "강의 스크립트 데이터 탐색적 분석",
  },
  "/preprocessing": {
    title: "전처리",
    description: "LangGraph 파이프라인과 텍스트 청킹 과정",
  },
  "/lectures": {
    title: "강의 평가",
    description: "개별 강의의 상세 평가 결과",
  },
  "/experiments": {
    title: "실험 비교",
    description: "A/B 실험 결과와 신뢰도 지표",
  },
  "/reports": {
    title: "리포트 생성",
    description: "평가 보고서 생성 및 내보내기",
  },
  "/settings": {
    title: "설정",
    description: "시스템 설정 및 환경 구성",
  },
};

export default function Header() {
  const pathname = usePathname();

  const basePath = "/" + (pathname.split("/")[1] ?? "");
  const pageInfo = PAGE_TITLES[basePath] ?? {
    title: "강의 분석",
    description: "",
  };

  return (
    <header
      className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md shadow-[0_1px_0_var(--border-light)]"
      style={{ height: "var(--header-height)" }}
    >
      <div className="flex items-center justify-between h-full px-10">
        <div>
          <h2 className="text-[22px] font-extrabold text-foreground tracking-tight">
            {pageInfo.title}
          </h2>
          {pageInfo.description && (
            <p
              className="text-sm text-text-secondary mt-0.5"
              style={{
                animation: "headerSubtitleFade 0.4s ease 0.1s both",
              }}
            >
              {pageInfo.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-[#F5F6F8] transition-all duration-200"
            title="설정"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16.2 12.2a1.2 1.2 0 00.24 1.32l.04.04a1.46 1.46 0 11-2.06 2.06l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.12a1.46 1.46 0 11-2.92 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.46 1.46 0 11-2.06-2.06l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.73h-.12a1.46 1.46 0 110-2.92h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.46 1.46 0 112.06-2.06l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.73-1.1v-.12a1.46 1.46 0 012.92 0v.06a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.46 1.46 0 112.06 2.06l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.73h.12a1.46 1.46 0 010 2.92h-.06a1.2 1.2 0 00-1.1.73z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
        </div>
      </div>
      <style jsx>{`
        @keyframes headerSubtitleFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
