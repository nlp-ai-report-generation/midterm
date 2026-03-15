import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { ShieldCheck, GraduationCap, BarChart3, MessageSquare, FileText } from "lucide-react";

const ROLES = [
  {
    key: "operator" as const,
    icon: ShieldCheck,
    title: "교육 운영 담당자",
    description: "전체 강의 품질을 관리하고, 강의 간 비교와 추이를 확인합니다.",
  },
  {
    key: "instructor" as const,
    icon: GraduationCap,
    title: "강사",
    description: "내 강의를 돌아보고, 구체적인 개선 방향을 확인합니다.",
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "AI 기반 강의 평가",
    description: "LLM이 18개 항목을 기준으로 강의를 분석합니다.",
  },
  {
    icon: MessageSquare,
    title: "근거 기반 피드백",
    description: "트랜스크립트에서 직접 인용한 근거를 함께 제공합니다.",
  },
  {
    icon: FileText,
    title: "데이터 분석",
    description: "발화량, 화자 구성, 소통 빈도 등 정량 분석을 지원합니다.",
  },
];

export default function RoleSelectPage() {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleSelect = (role: "operator" | "instructor") => {
    setRole(role);
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "var(--background)",
      }}
    >
      {/* 로고 + 제목 */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-inner)",
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--surface)",
          fontSize: 16,
          fontWeight: 800,
          marginBottom: 20,
        }}
      >
        L
      </div>
      <h1 className="text-title" style={{ textAlign: "center" }}>
        AI 강의 분석 리포트
      </h1>
      <p
        className="text-body"
        style={{ textAlign: "center", marginTop: 8, maxWidth: 400 }}
      >
        STT 트랜스크립트를 AI가 분석하여
        <br />
        강의 품질 개선을 위한 인사이트를 제공합니다.
      </p>

      {/* 기능 소개 */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 40,
          marginBottom: 48,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 720,
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              width: 220,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                flexShrink: 0,
              }}
            >
              <f.icon size={18} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </p>
              <p className="text-caption" style={{ marginTop: 2 }}>
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 역할 선택 */}
      <p className="text-label" style={{ marginBottom: 16 }}>
        시작하기
      </p>
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {ROLES.map((r) => (
          <button
            key={r.key}
            onClick={() => handleSelect(r.key)}
            className="card card-hover"
            style={{
              width: 280,
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              border: "none",
              textAlign: "center",
              transition: "box-shadow 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius)",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <r.icon size={26} />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {r.title}
            </span>
            <span className="text-caption">{r.description}</span>
          </button>
        ))}
      </div>

      <p
        className="text-caption"
        style={{ marginTop: 32, textAlign: "center" }}
      >
        설정에서 언제든 역할을 변경할 수 있습니다.
      </p>
    </div>
  );
}
