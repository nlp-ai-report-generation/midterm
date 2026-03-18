import { Link } from "react-router-dom";
import { BarChart2, TrendingUp, GitCompareArrows, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HubCard {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const CARDS: HubCard[] = [
  {
    to: "/eda",
    icon: BarChart2,
    title: "데이터 분석",
    desc: "발화량, 화자 구성, 습관 표현 등 강의 녹음에서 뽑은 데이터를 시각화해요",
  },
  {
    to: "/trends",
    icon: TrendingUp,
    title: "점수 추이",
    desc: "시간에 따라 카테고리별 점수가 어떻게 변하는지 추적해요",
  },
  {
    to: "/compare",
    icon: GitCompareArrows,
    title: "강의 비교",
    desc: "두 강의를 나란히 놓고 어떤 영역이 다른지 비교해요",
  },
  {
    to: "/items",
    icon: Layers,
    title: "항목별 분석",
    desc: "18개 평가 항목 중 하나를 골라 전 강의에 걸쳐 분석해요",
  },
];

export default function AnalysisHubPage() {
  return (
    <div
      className="page-content"
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div>
        <h1 className="text-title">분석</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          강의 데이터를 다양한 관점에서 살펴볼 수 있어요
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}
      >
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="card card-padded card-hover"
            style={{
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <card.icon size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                {card.title}
              </h2>
              <p className="text-body" style={{ lineHeight: 1.6 }}>
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
