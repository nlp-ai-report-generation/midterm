import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 점수(1-5)에 대응하는 컬러 반환 */
export function scoreColor(score: number): string {
  const SCORE_COLORS: Record<number, string> = {
    1: "var(--score-1)",
    2: "var(--score-2)",
    3: "var(--score-3)",
    4: "var(--score-4)",
    5: "var(--score-5)",
  };
  return SCORE_COLORS[Math.round(score)] ?? "var(--text-tertiary)";
}

/** 점수(1-5)에 대응하는 배지 텍스트 컬러 */
export function scoreBadgeTextColor(score: number): string {
  const rounded = Math.round(score);
  // 연한 배경(1-3)은 검정, 진한 배경(4-5)은 흰색
  return rounded <= 3 ? "var(--text-primary)" : "#FFFFFF";
}

/** 점수(1-5)에 대응하는 Tailwind 텍스트 클래스 */
export function scoreTextClass(score: number): string {
  const rounded = Math.round(score);
  const classes: Record<number, string> = {
    1: "text-[var(--score-1)]",
    2: "text-[var(--score-2)]",
    3: "text-[var(--score-3)]",
    4: "text-[var(--score-4)]",
    5: "text-[var(--score-5)]",
  };
  return classes[rounded] ?? "text-text-tertiary";
}

/** 점수(1-5)에 대응하는 라벨 */
export function scoreLabel(score: number): string {
  const rounded = Math.round(score);
  const labels: Record<number, string> = {
    1: "매우 미흡",
    2: "미흡",
    3: "보통",
    4: "우수",
    5: "매우 우수",
  };
  return labels[rounded] ?? "—";
}

/** 가중치 라벨 */
export function weightLabel(weight: string): string {
  const labels: Record<string, string> = {
    HIGH: "높음",
    MEDIUM: "보통",
    LOW: "낮음",
    high: "높음",
    medium: "보통",
    low: "낮음",
  };
  return labels[weight] ?? weight;
}

/** 날짜 포맷 (2026-02-02 → 2월 2일) */
export function formatDate(date: string): string {
  const parts = date.split("-");
  if (parts.length < 3) return date;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${month}월 ${day}일`;
}

/** 날짜 포맷 (2026-02-02 → 02/02) */
export function formatDateShort(date: string): string {
  const parts = date.split("-");
  if (parts.length < 3) return date;
  return `${parts[1]}/${parts[2]}`;
}
