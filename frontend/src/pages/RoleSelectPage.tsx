import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";

export default function RoleSelectPage() {
  const { user, loading, signInWithGoogle, signInWithNotion } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGuest = () => {
    setRole("operator");
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
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo + headline */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--primary)",
              marginBottom: 24,
            }}
          />
          <h1
            style={{
              fontSize: "clamp(24px, 6vw, 32px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              letterSpacing: "-0.03em",
            }}
          >
            AI 강의 분석 리포트
          </h1>
          <p
            className="text-body"
            style={{ marginTop: 12, maxWidth: 360 }}
          >
            STT 트랜스크립트를 AI가 분석해서
            <br />
            항목별 점수와 근거를 정리해드립니다.
          </p>
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={signInWithGoogle}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            구글로 시작하기
          </button>

          <button
            onClick={signInWithNotion}
            className="btn-secondary"
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            노션으로 시작하기
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            margin: "24px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            또는
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Guest link */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleGuest}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-secondary)",
              padding: "8px 0",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            둘러보기
          </button>
          <p
            className="text-caption"
            style={{ marginTop: 8 }}
          >
            로그인 없이도 샘플 데이터를 확인할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
