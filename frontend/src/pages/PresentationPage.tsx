import { Link } from "react-router-dom";

function normalizeDeckSrc(baseUrl: string) {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalized}presentation/index.html`;
}

export default function PresentationPage() {
  const deckSrc = normalizeDeckSrc(import.meta.env.BASE_URL);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f6f5f1 0%, #efede5 100%)",
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Public Presentation
          </p>
          <h1
            style={{
              margin: "4px 0 0",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            AI 강의 분석 리포트 생성기 중간발표
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" className="btn-secondary" style={{ padding: "10px 18px" }}>
            홈으로
          </Link>
          <a
            href={deckSrc}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: "10px 18px" }}
          >
            새 탭에서 열기
          </a>
        </div>
      </div>

      <div style={{ padding: 0, minHeight: 0 }}>
        <iframe
          src={deckSrc}
          title="AI 강의 분석 리포트 생성기 중간발표"
          style={{
            width: "100%",
            height: "calc(100vh - 81px)",
            border: "none",
            display: "block",
            background: "#efede5",
          }}
        />
      </div>
    </div>
  );
}
