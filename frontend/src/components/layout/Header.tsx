import { Link, useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "대시보드",
    description: "현재 내보낸 실제 평가 결과와 핵심 흐름을 확인하세요",
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
  const { pathname } = useLocation();

  const basePath = "/" + (pathname.split("/")[1] ?? "");
  const pageInfo = PAGE_TITLES[basePath] ?? {
    title: "강의 분석",
    description: "",
  };

  return (
    <header
      className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-5"
      style={{ height: "var(--header-height)" }}
    >
      <div className="surface-card flex h-full items-center justify-between px-5 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            analysis workspace
          </p>
          <h2 className="truncate text-[30px] font-bold tracking-[-0.05em] text-foreground">
            {pageInfo.title}
          </h2>
          {pageInfo.description ? (
            <p
              className="mt-1 truncate text-[14px] text-text-secondary"
              style={{ animation: "headerSubtitleFade 0.35s ease 0.05s both" }}
            >
              {pageInfo.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden rounded-full border border-[rgba(49,130,246,0.08)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-[12px] font-semibold text-text-secondary sm:block">
            실제 평가 결과 기준
          </div>
          <Link
            to="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-border-light bg-white text-text-tertiary shadow-[var(--shadow-xs)] hover:-translate-y-0.5 hover:text-foreground"
            title="설정"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16.2 12.2a1.2 1.2 0 00.24 1.32l.04.04a1.46 1.46 0 11-2.06 2.06l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.12a1.46 1.46 0 11-2.92 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.46 1.46 0 11-2.06-2.06l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.73h-.12a1.46 1.46 0 110-2.92h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.46 1.46 0 112.06-2.06l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.73-1.1v-.12a1.46 1.46 0 012.92 0v.06a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.46 1.46 0 112.06 2.06l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.73h.12a1.46 1.46 0 010 2.92h-.06a1.2 1.2 0 00-1.1.73z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
