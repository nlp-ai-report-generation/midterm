interface FeedbackCardProps {
  title: string;
  subtitle: string;
  items?: string[];
  color: string;
}

export default function FeedbackCard({ title, subtitle, items, color }: FeedbackCardProps) {
  return (
    <div className="card card-padded">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
      </div>
      <p className="text-caption" style={{ marginBottom: 20 }}>{subtitle}</p>
      {items && items.length > 0 ? (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
          {items.map((s, i) => (
            <li key={i} className="text-body" style={{ lineHeight: 1.8 }}>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption">아직 분석 결과가 없습니다</p>
      )}
    </div>
  );
}
