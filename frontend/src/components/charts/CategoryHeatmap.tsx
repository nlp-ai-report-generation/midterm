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
    <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
      <h3 className="text-base font-bold text-foreground mb-1">
        카테고리별 점수 히트맵
      </h3>
      <p className="text-sm text-text-secondary mb-6">
        5개 카테고리 × 15개 강의 점수 분포
      </p>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderSpacing: "3px", borderCollapse: "separate" }}>
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4 min-w-[100px]">
                카테고리
              </th>
              {data.map((d) => (
                <th
                  key={d.date}
                  className="text-center text-xs font-medium text-text-tertiary pb-3 px-1"
                >
                  {formatDateShort(d.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryNames.map((cat) => (
              <tr key={cat}>
                <td className="text-[13px] font-medium text-text-secondary py-1.5 pr-4 whitespace-nowrap">
                  {SHORT_CATEGORY_NAMES[cat] ?? cat}
                </td>
                {data.map((d) => {
                  const score = d.categories[cat] ?? 0;
                  return (
                    <td key={d.date} className="px-0.5 py-0.5">
                      <div
                        className="w-full aspect-square rounded-xl flex items-center justify-center text-white text-xs font-bold min-w-[38px] transition-transform hover:scale-110"
                        style={{
                          backgroundColor: scoreColor(score),
                          opacity: score > 0 ? 1 : 0.2,
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

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border-light">
        <span className="text-xs text-text-tertiary">점수:</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-3.5 rounded-md"
              style={{ backgroundColor: scoreColor(s) }}
            />
            <span className="text-xs text-text-tertiary">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
