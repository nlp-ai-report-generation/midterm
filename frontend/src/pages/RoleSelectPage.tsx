import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            {step === "login" && "강의가 어땠는지,\n데이터로 확인해보세요."}
            {step === "role" && "어떤 관점에서\n보시겠어요?"}
            {step === "instructor-name" && "이름을 알려주세요."}
          </h1>
          <p className="text-body" style={{ marginTop: 10, whiteSpace: "pre-line" }}>
            {step === "login" && "항목별 점수와 근거를 정리해드려요."}
            {step === "role" && "역할에 따라 화면 구성이 달라져요."}
            {step === "instructor-name" && "해당 강사의 강의만 골라서 보여드려요."}
          </p>
        </div>

        {/* Step 1: 로그인 */}
        {step === "login" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={signInWithGoogle}
                className="btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                구글로 시작하기
              </button>
              <button
                onClick={signInWithNotion}
                className="btn-secondary"
                style={{ width: "100%", padding: "14px", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "serif", lineHeight: 1 }}>N</span>
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
              <Link
                to="/presentation"
                style={{
                  display: "inline-flex",
                  marginTop: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                소개 페이지 가기
              </Link>
            </div>
          </>
        )}

        {/* Step 2: 역할 선택 */}
        {step === "role" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { key: "operator" as const, title: "운영 담당자", desc: "전체 강의 품질을 비교하고 관리해요" },
              { key: "instructor" as const, title: "강사", desc: "내 강의를 돌아보고 다음 수업을 준비해요" },
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
