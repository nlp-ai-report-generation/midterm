import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getAllEvaluations } from "@/lib/data";
import {
  scoreColor,
  scoreBadgeTextColor,
  formatDateShort,
} from "@/lib/utils";
import type { EvaluationResult, ItemScore } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "1. 언어 표현 품질",
  "2. 강의 도입 및 구조",
  "3. 개념 설명 명확성",
  "4. 예시 및 실습 연계",
  "5. 수강생 상호작용",
];

interface ItemOption {
  id: string;
  name: string;
  category: string;
}

export default function ItemAnalysisPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState("");

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        const sorted = data.sort((a, b) =>
          a.lecture_date.localeCompare(b.lecture_date)
        );
        setEvaluations(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  // Build item options from first evaluation that has data
  const itemOptions = useMemo((): ItemOption[] => {
    const items: ItemOption[] = [];
    const seen = new Set<string>();

    for (const ev of evaluations) {
      for (const cat of ev.category_results) {
        for (const item of cat.items) {
          if (!seen.has(item.item_id)) {
            seen.add(item.item_id);
            items.push({
              id: item.item_id,
              name: item.item_name,
              category: item.category,
            });
          }
        }
      }
    }

    return items.sort((a, b) => a.id.localeCompare(b.id));
  }, [evaluations]);

  // Auto-select first item
  useEffect(() => {
    if (itemOptions.length > 0 && !selectedItem) {
      setSelectedItem(itemOptions[0].id);
    }
  }, [itemOptions, selectedItem]);

  // Get data for the selected item across all lectures
  const itemData = useMemo(() => {
    if (!selectedItem) return [];

    return evaluations
      .map((ev) => {
        let found: ItemScore | null = null;
        for (const cat of ev.category_results) {
          for (const item of cat.items) {
            if (item.item_id === selectedItem) {
              found = item;
              break;
            }
          }
          if (found) break;
        }
        return {
          date: ev.lecture_date,
          subject: ev.metadata?.subjects?.[0] ?? "강의",
          score: found?.score ?? 0,
          evidence: found?.evidence ?? [],
          reasoning: found?.reasoning ?? "",
          itemName: found?.item_name ?? "",
        };
      })
      .filter((d) => d.score > 0);
  }, [evaluations, selectedItem]);

  const selectedItemInfo = itemOptions.find((i) => i.id === selectedItem);

  // Group items by category for the dropdown
  const groupedItems = useMemo(() => {
    const groups = new Map<string, ItemOption[]>();
    for (const cat of CATEGORY_NAMES) {
      groups.set(cat, []);
    }
    for (const item of itemOptions) {
      const catKey =
        CATEGORY_NAMES.find((c) => c === item.category) ?? item.category;
      if (!groups.has(catKey)) groups.set(catKey, []);
      groups.get(catKey)!.push(item);
    }
    return groups;
  }, [itemOptions]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="page-content"
      style={{ display: "flex", flexDirection: "column", gap: 36 }}
    >
      {/* Title */}
      <div>
        <h1 className="text-title">항목별 분석</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          개별 평가 항목의 점수와 근거를 강의별로 확인합니다
        </p>
      </div>

      {/* Item Selector */}
      <div className="card card-padded">
        <label
          className="text-label"
          style={{ marginBottom: 8, display: "block" }}
        >
          평가 항목 선택
        </label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "var(--radius-inner)",
            background: "var(--grey-50)",
            color: "var(--text-primary)",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {Array.from(groupedItems.entries()).map(([cat, items]) => (
            <optgroup
              key={cat}
              label={cat.replace(/^\d+\.\s*/, "")}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}. {item.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Bar Chart */}
      {selectedItemInfo && itemData.length > 0 && (
        <div className="card card-padded">
          <h2 className="text-section" style={{ marginBottom: 4 }}>
            {selectedItemInfo.id}. {selectedItemInfo.name}
          </h2>
          <p className="text-caption" style={{ marginBottom: 24 }}>
            {itemData.length}개 강의 점수 분포
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={itemData}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  boxShadow:
                    "0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)",
                  padding: "12px 16px",
                }}
                labelFormatter={(l) => formatDateShort(l as string)}
                formatter={(value) => [Number(value), "점"]}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {itemData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={scoreColor(entry.score)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Evidence per lecture */}
      {itemData.length > 0 && (
        <div>
          <h2 className="text-section" style={{ marginBottom: 16 }}>
            강의별 근거 및 추론
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {itemData.map((row) => (
              <div key={row.date} className="inner-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <span
                      className="text-caption"
                      style={{ fontFamily: "monospace" }}
                    >
                      {formatDateShort(row.date)}
                    </span>
                    <span
                      className="text-body"
                      style={{
                        marginLeft: 12,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {row.subject}
                    </span>
                  </div>
                  <span
                    className="score-badge score-badge-sm"
                    style={{
                      backgroundColor: scoreColor(row.score),
                      color: scoreBadgeTextColor(row.score),
                    }}
                  >
                    {row.score}
                  </span>
                </div>

                {/* Reasoning */}
                {row.reasoning && (
                  <div style={{ marginBottom: 12 }}>
                    <p
                      className="text-label"
                      style={{ marginBottom: 4, fontSize: 11 }}
                    >
                      추론
                    </p>
                    <p className="text-body">{row.reasoning}</p>
                  </div>
                )}

                {/* Evidence */}
                {row.evidence.length > 0 && (
                  <div>
                    <p
                      className="text-label"
                      style={{ marginBottom: 4, fontSize: 11 }}
                    >
                      근거
                    </p>
                    <ul
                      style={{
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {row.evidence.map((ev, i) => (
                        <li
                          key={i}
                          className="text-body"
                          style={{
                            paddingLeft: 12,
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              color: "var(--text-muted)",
                            }}
                          >
                            ·
                          </span>
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
