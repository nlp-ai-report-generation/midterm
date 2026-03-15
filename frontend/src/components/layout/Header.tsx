"use client";

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
      className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border-light"
      style={{ height: "var(--header-height)" }}
    >
      <div className="flex items-center justify-between h-full px-8">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {pageInfo.title}
          </h2>
          {pageInfo.description && (
            <p className="text-sm text-text-secondary mt-0.5">
              {pageInfo.description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
