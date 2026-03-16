import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";

export default function RoleSelectPage() {
  const { role, setRole, setInstructorName } = useRole();
  const navigate = useNavigate();

  // 이미 역할이 설정되어 있으면 대시보드로
  useEffect(() => {
    if (role) navigate("/dashboard", { replace: true });
  }, [role, navigate]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState("김영아");

  const pickOperator = () => {
    setRole("operator");
    navigate("/dashboard");
  };

  const pickInstructor = () => {
    setShowNameInput(true);
  };

  const submitInstructor = () => {
    setRole("instructor");
    setInstructorName(name.trim() || "김영아");
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* 헤드라인 */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--primary)",
              marginBottom: 28,
            }}
          />
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              letterSpacing: "-0.03em",
            }}
          >
            강의가 어땠는지,
            <br />
            데이터로 확인하세요.
          </h1>
          <p
            className="text-body"
            style={{ marginTop: 12, maxWidth: 360 }}
          >
            15개 강의의 STT 트랜스크립트를 AI가 분석해서
            항목별 점수와 근거를 정리해드립니다.
          </p>
        </div>

        {!showNameInput ? (
          <>
            {/* 역할 선택 */}
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 12,
              }}
            >
              어떤 관점에서 보시겠어요?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={pickOperator}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  cursor: "pointer",
                  border: "none",
                  textAlign: "left",
                  transition: "box-shadow 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    운영 담당자
                  </p>
                  <p className="text-caption" style={{ marginTop: 4 }}>
                    전체 강의 품질을 비교하고 관리합니다
                  </p>
                </div>
                <span style={{ fontSize: 20, color: "var(--text-muted)" }}>→</span>
              </button>

              <button
                onClick={pickInstructor}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  cursor: "pointer",
                  border: "none",
                  textAlign: "left",
                  transition: "box-shadow 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    강사
                  </p>
                  <p className="text-caption" style={{ marginTop: 4 }}>
                    내 강의를 돌아보고 다음 수업을 준비합니다
                  </p>
                </div>
                <span style={{ fontSize: 20, color: "var(--text-muted)" }}>→</span>
              </button>
            </div>

            <p
              className="text-caption"
              style={{ marginTop: 24 }}
            >
              언제든 설정에서 바꿀 수 있어요.
            </p>
          </>
        ) : (
          <>
            {/* 강사 이름 입력 */}
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 12,
              }}
            >
              이름을 입력해주세요
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="강사 이름"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitInstructor();
                }}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowNameInput(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  뒤로
                </button>
                <button
                  onClick={submitInstructor}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  시작하기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
