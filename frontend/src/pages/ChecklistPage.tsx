const CHECKLIST = [
  {
    category: "1. 언어 표현 품질",
    items: [
      { id: "1.1", name: "불필요한 반복 표현", desc: "동일 단어/문장 및 '이제', '그래서' 등 특정 표현을 과도하게 반복하지 않는가", weight: "높음" as const },
      { id: "1.2", name: "발화 완결성", desc: "문장이 완결된 형태로 끝맺음되는가", weight: "중간" as const },
      { id: "1.3", name: "언어 일관성", desc: "강의 전반에 걸쳐 존댓말/반말이 일관되게 사용되는가", weight: "중간" as const },
    ],
  },
  {
    category: "2. 강의 도입 및 구조",
    items: [
      { id: "2.1", name: "학습 목표 안내", desc: "강의 시작 시 오늘의 학습 목표와 진행 순서를 명확히 안내하는가", weight: "높음" as const },
      { id: "2.2", name: "전날 복습 연계", desc: "이전 강의 내용을 간략히 복습하고 오늘 내용과 연결하는가", weight: "높음" as const },
      { id: "2.3", name: "설명 순서", desc: "개념 → 예시 → 실습의 순서로 구조적으로 설명하는가", weight: "중간" as const },
      { id: "2.4", name: "핵심 내용 강조", desc: "중요한 내용을 반복하거나 강조하여 전달하는가", weight: "중간" as const },
      { id: "2.5", name: "마무리 요약", desc: "강의 마무리 시 핵심 내용을 요약 정리하는가", weight: "낮음" as const },
    ],
  },
  {
    category: "3. 개념 설명 명확성",
    items: [
      { id: "3.1", name: "개념 정의", desc: "핵심 개념을 처음 등장 시 명확하게 정의하는가", weight: "높음" as const },
      { id: "3.2", name: "비유 및 예시 활용", desc: "어려운 개념에 적절한 비유나 실생활 예시를 활용하는가", weight: "높음" as const },
      { id: "3.3", name: "선행 개념 확인", desc: "선행 개념 없이 갑자기 심화 내용으로 넘어가지 않는가", weight: "중간" as const },
      { id: "3.4", name: "발화 속도 적절성", desc: "분당 발화량이 수강생이 따라가기 적절한 수준인가", weight: "중간" as const },
    ],
  },
  {
    category: "4. 예시 및 실습 연계",
    items: [
      { id: "4.1", name: "예시 적절성", desc: "예시가 강의 수준 및 실제 업무 현장과 연관성이 있는가", weight: "높음" as const },
      { id: "4.2", name: "실습 연계", desc: "이론 설명 후 실습으로 자연스럽게 연결되는가", weight: "높음" as const },
    ],
  },
  {
    category: "5. 수강생 상호작용",
    items: [
      { id: "5.1", name: "오류 대응", desc: "실습 중 발생하는 오류나 질문에 적절히 대응하는가", weight: "중간" as const },
      { id: "5.2", name: "이해 확인 질문", desc: "수강생의 이해 여부를 확인하는 질문을 적절히 하는가", weight: "높음" as const },
      { id: "5.3", name: "참여 유도", desc: "수강생의 직접 참여를 유도하는가", weight: "높음" as const },
      { id: "5.4", name: "질문 응답 충분성", desc: "수강생 질문에 명확하고 충분하게 답변하는가", weight: "높음" as const },
    ],
  },
];

type Weight = "높음" | "중간" | "낮음";

const WEIGHT_STYLES: Record<Weight, { background: string; color: string }> = {
  "높음": { background: "var(--primary-light)", color: "var(--primary)" },
  "중간": { background: "var(--grey-100)", color: "var(--text-secondary)" },
  "낮음": { background: "var(--grey-100)", color: "var(--text-muted)" },
};

function countByWeight(weight: Weight): number {
  return CHECKLIST.reduce(
    (sum, cat) => sum + cat.items.filter((item) => item.weight === weight).length,
    0,
  );
}

const totalItems = CHECKLIST.reduce((sum, cat) => sum + cat.items.length, 0);

export default function ChecklistPage() {
  return (
    <div className="page-content">
      <div>
        <h1 className="text-title">평가 기준</h1>
        <p className="text-caption mt-1">
          5개 카테고리, 18개 항목으로 강의 품질을 평가합니다
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          marginTop: 20,
          marginBottom: 8,
          fontSize: 13,
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          {totalItems}개 항목
        </span>
        <span style={{ color: "var(--text-muted)" }}>&middot;</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <WeightBadge weight="높음" />
          {countByWeight("높음")}개
        </span>
        <span style={{ color: "var(--text-muted)" }}>&middot;</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <WeightBadge weight="중간" />
          {countByWeight("중간")}개
        </span>
        <span style={{ color: "var(--text-muted)" }}>&middot;</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <WeightBadge weight="낮음" />
          {countByWeight("낮음")}개
        </span>
      </div>

      {/* Category cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {CHECKLIST.map((cat) => (
          <div key={cat.category} className="card card-padded">
            <h2 className="text-section" style={{ marginBottom: 16 }}>
              {cat.category}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cat.items.map((item) => (
                <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: 12,
                        color: "var(--text-muted)",
                        minWidth: 28,
                      }}
                    >
                      {item.id}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.name}
                    </span>
                    <WeightBadge weight={item.weight} />
                  </div>
                  <p
                    className="text-body"
                    style={{ paddingLeft: 38, margin: 0 }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeightBadge({ weight }: { weight: Weight }) {
  const style = WEIGHT_STYLES[weight];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "18px",
        background: style.background,
        color: style.color,
      }}
    >
      {weight}
    </span>
  );
}
