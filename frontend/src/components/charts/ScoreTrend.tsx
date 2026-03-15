"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { formatDateShort } from "@/lib/utils";

interface ScoreTrendProps {
  data: { date: string; score: number }[];
  height?: number;
}

export default function ScoreTrend({ data, height = 340 }: ScoreTrendProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
      <h3 className="text-base font-bold text-foreground mb-1">
        강의 점수 트렌드
      </h3>
      <p className="text-sm text-text-secondary mb-6">
        15개 강의의 가중 평균 점수 추이
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-light)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontSize: 13, fill: "var(--text-tertiary)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 13, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-lg)",
              padding: "14px 20px",
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
              r: 5,
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
