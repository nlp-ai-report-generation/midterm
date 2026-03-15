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
  return (
    <div className="surface-card-strong rounded-[28px] p-6">
      <h3 className="text-[20px] font-bold text-foreground">
        강의 점수 트렌드
      </h3>
      <p className="mb-6 mt-1 text-[15px] text-text-secondary">
        날짜 순으로 실제 평가 점수 흐름을 확인합니다.
      </p>
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
              borderRadius: "18px",
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
