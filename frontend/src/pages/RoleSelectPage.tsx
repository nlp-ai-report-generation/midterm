import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { ShieldCheck, GraduationCap } from "lucide-react";

const ROLES = [
  {
    key: "operator" as const,
    icon: ShieldCheck,
    title: "교육 운영 담당자",
    description: "전체 강의 품질을 관리하고 비교합니다",
  },
  {
    key: "instructor" as const,
    icon: GraduationCap,
    title: "강사",
    description: "내 강의를 돌아보고 다음 수업을 준비합니다",
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
        padding: "40px 24px",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--surface)",
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 16,
        }}
      >
        L
      </div>
      <h1 className="text-title" style={{ marginBottom: 8 }}>
        강의 분석
      </h1>
      <p className="text-body" style={{ marginBottom: 48 }}>
        역할을 선택해 주세요
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
              width: 260,
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              border: "none",
              textAlign: "center",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius)",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <r.icon size={28} />
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
            <span className="text-body">{r.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
