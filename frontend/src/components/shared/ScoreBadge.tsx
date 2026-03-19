import { scoreColor, scoreBadgeTextColor } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
  className?: string;
}

export default function ScoreBadge({ score, size = "sm", className = "" }: ScoreBadgeProps) {
  const sizeClass = size === "lg" ? "score-badge-lg" : "score-badge-sm";

  return (
    <span
      className={`score-badge ${sizeClass} ${className}`}
      style={{
        backgroundColor: scoreColor(score),
        color: scoreBadgeTextColor(score),
      }}
    >
      {score.toFixed(1)}
    </span>
  );
}
