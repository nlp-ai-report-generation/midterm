"use client";

import { formatDateShort, scoreColor } from "@/lib/utils";

interface HeatmapProps {
  data: {
    date: string;
    categories: Record<string, number>;
  }[];
  categoryNames: string[];
}

const SHORT_CATEGORY_NAMES: Record<string, string> = {
  "언어 표현 품질": "언어 품질",
  "강의 도입 및 구조": "강의 구조",
  "개념 설명 명확성": "개념 명확성",
  "예시 및 실습 연계": "예시/실습",
  "수강생 상호작용": "상호작용",
};

export default function CategoryHeatmap({ data, categoryNames }: HeatmapProps) {
  return (
    <div className="surface-card-strong rounded-[28px] p-6">
      <h3 className="text-[20px] font-bold text-foreground">
        카테고리별 점수 히트맵
      </h3>
      <p className="mb-6 mt-1 text-[15px] text-text-secondary">
        어떤 카테고리에서 흔들리는지 날짜 단위로 비교합니다.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderSpacing: "6px", borderCollapse: "separate" }}>
          <thead>
            <tr>
              <th className="min-w-[100px] pb-3 pr-4 text-left text-[12px] font-semibold text-text-tertiary">
                카테고리
              </th>
              {data.map((d) => (
                <th
                  key={d.date}
                  className="px-1 pb-3 text-center text-[12px] font-semibold text-text-tertiary"
                >
                  {formatDateShort(d.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryNames.map((cat) => (
              <tr key={cat}>
                <td className="whitespace-nowrap py-1.5 pr-4 text-[13px] font-semibold text-text-secondary">
                  {SHORT_CATEGORY_NAMES[cat] ?? cat}
                </td>
                {data.map((d) => {
                  const score = d.categories[cat] ?? 0;
                  return (
                    <td key={d.date} className="px-0.5 py-0.5">
                      <div
                        className="flex aspect-square min-w-[40px] items-center justify-center rounded-[16px] text-[12px] font-bold text-white transition-transform hover:scale-105"
                        style={{
                          background: score > 0
                            ? `linear-gradient(180deg, color-mix(in srgb, ${scoreColor(score)} 84%, white), ${scoreColor(score)})`
                            : "var(--grey-100)",
                          opacity: score > 0 ? 1 : 0.2,
                          boxShadow: score > 0 ? "0 10px 20px rgba(15, 23, 42, 0.10)" : "none",
                        }}
                        title={`${formatDateShort(d.date)} - ${cat}: ${score.toFixed(1)}`}
                      >
                        {score > 0 ? score.toFixed(1) : "—"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-divider pt-4">
        <span className="text-[12px] font-semibold text-text-tertiary">점수</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-md"
              style={{ backgroundColor: scoreColor(s) }}
            />
            <span className="text-[12px] text-text-tertiary">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
