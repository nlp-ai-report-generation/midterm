import { Link } from "react-router-dom";
import { GitCompare, ShieldCheck, List } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HubCard {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const CARDS: HubCard[] = [
  {
    to: "/experiments",
    icon: GitCompare,
    title: "모델 비교",
    desc: "3개 AI 모델이 같은 강의를 평가한 결과를 비교해요. 어떤 모델이 어떤 경향이 있는지 볼 수 있어요",
  },
  {
    to: "/validation",
    icon: ShieldCheck,
    title: "신뢰성 검증",
    desc: "AI 평가가 일관적인지, 청크 크기가 점수에 영향을 주는지 통계로 확인해요",
  },
  {
    to: "/checklist",
    icon: List,
    title: "평가 기준",
    desc: "18개 평가 항목과 가중치를 확인하고, 어떤 기준으로 채점하는지 살펴볼 수 있어요",
  },
];

export default function VerificationHubPage() {
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
        <h1 className="text-title">검증</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          AI 평가 결과를 믿을 수 있는지 확인해볼 수 있어요
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
