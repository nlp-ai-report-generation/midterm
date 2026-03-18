import { useState } from "react";

interface PromptViewerProps {
  editable?: boolean;
}

const CATEGORIES = [
  {
    key: "language",
    label: "언어 품질",
    description: "불필요한 반복 표현, 발화 완결성, 언어 일관성을 평가해요",
    items: "3개 항목 (반복 표현, 완결성, 일관성)",
  },
  {
    key: "structure",
    label: "강의 구조",
    description:
      "학습 목표 안내, 전날 복습, 설명 순서, 핵심 강조, 마무리를 평가해요",
    items: "5개 항목",
  },
  {
    key: "clarity",
    label: "개념 명확성",
    description:
      "개념 정의, 비유/예시 활용, 선행 개념 확인, 발화 속도를 평가해요",
    items: "4개 항목",
  },
  {
    key: "examples",
    label: "예시/실습",
    description: "예시 적절성, 실습 연결, 오류 대응을 평가해요",
    items: "3개 항목",
  },
  {
    key: "interaction",
    label: "상호작용",
    description: "이해도 확인, 참여 유도, 응답 충분성을 평가해요",
    items: "3개 항목",
  },
];

export default function PromptViewer({ editable = false }: PromptViewerProps) {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].key);
  const [customInstructions, setCustomInstructions] = useState<
    Record<string, string>
  >({});

  const active = CATEGORIES.find((c) => c.key === activeTab) ?? CATEGORIES[0];

  return (
    <div>
      <div className="tab-bar" style={{ flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={activeTab === cat.key}
            onClick={() => setActiveTab(cat.key)}
            className="tab-item"
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="card card-padded" style={{ marginTop: 16 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          {active.label}
        </h3>
        <p className="text-body" style={{ marginBottom: 8 }}>
          {active.description}
        </p>
        <p className="text-caption">{active.items}</p>

        {editable && (
          <div style={{ marginTop: 20 }}>
            <label
              htmlFor={`custom-${active.key}`}
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 8,
              }}
            >
              추가 지시사항
            </label>
            <textarea
              id={`custom-${active.key}`}
              value={customInstructions[active.key] ?? ""}
              onChange={(e) =>
                setCustomInstructions((prev) => ({
                  ...prev,
                  [active.key]: e.target.value,
                }))
              }
              placeholder="이 카테고리에 대한 추가 지시사항을 입력하세요..."
              className="input-field"
              style={{
                minHeight: 100,
                resize: "vertical",
                lineHeight: 1.8,
                fontFamily: "inherit",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
