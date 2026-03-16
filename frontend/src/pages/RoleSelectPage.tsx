import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";

type Step = "login" | "role" | "instructor-name";

export default function RoleSelectPage() {
  const { user, loading, signInWithGoogle, signInWithNotion } = useAuth();
  const { role, setRole, setInstructorName } = useRole();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("김영아");

  // 이미 로그인 + 역할 설정 완료 → 대시보드로
  useEffect(() => {
    if (!loading && user && role) {
      navigate("/dashboard", { replace: true });
    }
    // 로그인 완료했지만 역할 미설정 → 역할 선택 단계로
    if (!loading && user && !role) {
      setStep("role");
    }
  }, [user, role, loading, navigate]);

  const handleGuest = () => {
    setStep("role");
  };

  const pickRole = (r: "operator" | "instructor") => {
    if (r === "instructor") {
      setStep("instructor-name");
    } else {
      setRole("operator");
      navigate("/dashboard");
    }
  };

  const submitInstructor = () => {
    setRole("instructor");
    setInstructorName(name.trim() || "김영아");
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* 로고 + 제목 (항상 표시) */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--primary)",
              marginBottom: 20,
            }}
          />
          <h1
            style={{
              fontSize: "clamp(22px, 5vw, 28px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.35,
              letterSpacing: "-0.03em",
            }}
          >
            {step === "login" && "강의가 어땠는지,\n데이터로 확인하세요."}
            {step === "role" && "어떤 관점에서\n보시겠어요?"}
            {step === "instructor-name" && "이름을 알려주세요."}
          </h1>
          <p className="text-body" style={{ marginTop: 10, whiteSpace: "pre-line" }}>
            {step === "login" && "AI가 항목별 점수와 근거를 정리해드립니다."}
            {step === "role" && "역할에 따라 화면 구성이 달라집니다."}
            {step === "instructor-name" && "해당 강사의 강의만 필터링해서 보여드립니다."}
          </p>
        </div>

        {/* Step 1: 로그인 */}
        {step === "login" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={signInWithGoogle}
                className="btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: 15, cursor: "pointer" }}
              >
                구글로 시작하기
              </button>
              <button
                onClick={signInWithNotion}
                className="btn-secondary"
                style={{ width: "100%", padding: "14px", fontSize: 15, cursor: "pointer" }}
              >
                노션으로 시작하기
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>또는</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleGuest}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  padding: "8px 0",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                둘러보기
              </button>
              <p className="text-caption" style={{ marginTop: 6, fontSize: 12 }}>
                로그인 없이 샘플 데이터를 확인할 수 있어요
              </p>
            </div>
          </>
        )}

        {/* Step 2: 역할 선택 */}
        {step === "role" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { key: "operator" as const, title: "운영 담당자", desc: "전체 강의 품질을 비교하고 관리합니다" },
              { key: "instructor" as const, title: "강사", desc: "내 강의를 돌아보고 다음 수업을 준비합니다" },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => pickRole(r.key)}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 22px",
                  cursor: "pointer",
                  border: "none",
                  textAlign: "left",
                  transition: "box-shadow 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{r.title}</p>
                  <p className="text-caption" style={{ marginTop: 3 }}>{r.desc}</p>
                </div>
                <span style={{ fontSize: 18, color: "var(--text-muted)" }}>→</span>
              </button>
            ))}

            <p className="text-caption" style={{ marginTop: 12 }}>
              언제든 설정에서 바꿀 수 있어요.
            </p>
          </div>
        )}

        {/* Step 3: 강사 이름 입력 */}
        {step === "instructor-name" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="강사 이름"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") submitInstructor(); }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep("role")}
                className="btn-secondary"
                style={{ flex: 1, cursor: "pointer" }}
              >
                뒤로
              </button>
              <button
                onClick={submitInstructor}
                className="btn-primary"
                style={{ flex: 1, cursor: "pointer" }}
              >
                시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
