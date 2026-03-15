import {
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateShort } from "@/lib/utils";

interface ScoreTrendProps {
  data: { date: string; score: number }[];
  height?: number;
}

export default function ScoreTrend({ data, height = 340 }: ScoreTrendProps) {
  const avgScore =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.score, 0) / data.length
      : 0;

  return (
    <div className="panel-card">
      <div className="panel-heading">
        <div>
          <h3 className="panel-title">강의 점수 흐름</h3>
          <p className="panel-copy">날짜 순으로 실제 평가 점수 변동을 읽습니다.</p>
        </div>
        <div className="rounded-[20px] bg-[var(--surface-subtle)] px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
            평균
          </p>
          <p className="mt-1 text-[24px] font-bold tracking-[-0.05em] text-foreground">
            {avgScore.toFixed(2)}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.26} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="var(--divider)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-light)",
              borderRadius: "20px",
              boxShadow: "var(--shadow-md)",
              padding: "12px 16px",
            }}
            labelFormatter={(label) => `${formatDateShort(label as string)}`}
            formatter={(value) => [Number(value).toFixed(2), "가중 평균"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={3}
            fill="url(#scoreGradient)"
            dot={{
              r: 4.5,
              fill: "var(--surface)",
              stroke: "var(--primary)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "var(--primary)",
              stroke: "var(--surface)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
