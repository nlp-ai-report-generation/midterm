import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import ScoreBadge from "@/components/shared/ScoreBadge";

// ── 실험 1: 평가 일관성 데이터 ──────────────────────────────

const RELIABILITY_DATA = [
  { date: "02-02", icc: 0.895, kappa: 0.909, alpha: 0.891, ssi: 0.969 },
  { date: "02-03", icc: 0.890, kappa: 0.879, alpha: 0.886, ssi: 0.975 },
  { date: "02-04", icc: 0.757, kappa: 0.699, alpha: 0.748, ssi: 0.935 },
  { date: "02-05", icc: 0.767, kappa: 0.826, alpha: 0.761, ssi: 0.951 },
  { date: "02-06", icc: 0.893, kappa: 0.958, alpha: 0.889, ssi: 0.975 },
  { date: "02-09", icc: 0.697, kappa: 0.790, alpha: 0.690, ssi: 0.951 },
  { date: "02-10", icc: 0.820, kappa: 0.830, alpha: 0.814, ssi: 0.969 },
  { date: "02-11", icc: 0.930, kappa: 0.922, alpha: 0.927, ssi: 0.982 },
  { date: "02-12", icc: 0.920, kappa: 0.910, alpha: 0.917, ssi: 0.982 },
  { date: "02-13", icc: 0.924, kappa: 0.924, alpha: 0.921, ssi: 0.982 },
  { date: "02-23", icc: 0.812, kappa: 0.775, alpha: 0.806, ssi: 0.982 },
  { date: "02-24", icc: 0.981, kappa: 0.970, alpha: 0.981, ssi: 0.994 },
  { date: "02-25", icc: 0.924, kappa: 0.918, alpha: 0.921, ssi: 0.982 },
  { date: "02-26", icc: 0.964, kappa: 0.970, alpha: 0.962, ssi: 0.988 },
  { date: "02-27", icc: 0.978, kappa: 0.965, alpha: 0.977, ssi: 0.994 },
];

const OVERALL_METRICS = {
  icc: 0.877,
  kappa: 0.883,
  alpha: 0.873,
  ssi: 0.974,
};

// ── 실험 2: 청크 크기 비교 데이터 ──────────────────────────

const CHUNK_COMPARISON = [
  { date: "02-02", chunk30: 2.978, chunk15: 3.156 },
  { date: "02-03", chunk30: 2.956, chunk15: 2.867 },
  { date: "02-04", chunk30: 3.333, chunk15: 2.867 },
  { date: "02-05", chunk30: 3.156, chunk15: 3.111 },
  { date: "02-06", chunk30: 3.178, chunk15: 3.022 },
  { date: "02-09", chunk30: 3.511, chunk15: 3.111 },
  { date: "02-10", chunk30: 3.511, chunk15: 3.244 },
  { date: "02-11", chunk30: 3.156, chunk15: 3.022 },
  { date: "02-12", chunk30: 3.333, chunk15: 3.089 },
  { date: "02-13", chunk30: 3.333, chunk15: 2.978 },
  { date: "02-23", chunk30: 3.400, chunk15: 3.133 },
  { date: "02-24", chunk30: 3.356, chunk15: 3.067 },
  { date: "02-25", chunk30: 2.822, chunk15: 2.911 },
  { date: "02-26", chunk30: 3.356, chunk15: 2.933 },
  { date: "02-27", chunk30: 3.289, chunk15: 2.978 },
];

const TTEST_RESULTS = {
  mean30: 3.245,
  mean15: 3.033,
  diff: 0.212,
  t: 4.421,
  df: 14,
  p: 0.0006,
  cohensD: 1.142,
  ci: [0.118, 0.306] as [number, number],
};

// ── ICC 해석 색상 ──────────────────────────────────────────

function iccColor(icc: number): string {
  if (icc >= 0.9) return "#22C55E";
  if (icc >= 0.75) return "#3B82F6";
  if (icc >= 0.5) return "#F59E0B";
  return "#EF4444";
}

function iccLabel(icc: number): string {
  if (icc >= 0.9) return "Excellent";
  if (icc >= 0.75) return "Good";
  if (icc >= 0.5) return "Moderate";
  return "Poor";
}

// ── 탭 ─────────────────────────────────────────────────────

type Tab = "consistency" | "chunk";

export default function ValidationPage() {
  const [tab, setTab] = useState<Tab>("consistency");

  return (
    <div
      className="page-content"
      style={{ display: "flex", flexDirection: "column", gap: 36 }}
    >
      {/* Title */}
      <div>
        <h1 className="text-title">신뢰성 검증</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          AI 평가 결과를 믿을 수 있는지, 통계적으로 확인한 결과예요
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-item ${tab === "consistency" ? "active" : ""}`}
          onClick={() => setTab("consistency")}
        >
          평가 일관성
        </button>
        <button
          className={`tab-item ${tab === "chunk" ? "active" : ""}`}
          onClick={() => setTab("chunk")}
        >
          청크 크기 영향
        </button>
      </div>

      {tab === "consistency" ? <ConsistencyTab /> : <ChunkTab />}
    </div>
  );
}

// ── 탭 1: 평가 일관성 ──────────────────────────────────────

function ConsistencyTab() {
  return (
    <>
      {/* Overview cards */}
      <div
        className="card-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {[
          {
            label: "ICC",
            value: OVERALL_METRICS.icc,
            desc: "급내상관계수",
            verdict: "Good",
          },
          {
            label: "Cohen's κ",
            value: OVERALL_METRICS.kappa,
            desc: "가중 카파",
            verdict: "Almost Perfect",
          },
          {
            label: "Krippendorff's α",
            value: OVERALL_METRICS.alpha,
            desc: "다평가자 신뢰도",
            verdict: "Reliable",
          },
          {
            label: "SSI",
            value: OVERALL_METRICS.ssi,
            desc: "점수 안정성",
            verdict: "Very Stable",
          },
        ].map((m) => (
          <div key={m.label} className="card card-padded">
            <span className="text-label">{m.label}</span>
            <p className="text-number" style={{ marginTop: 8 }}>
              {m.value.toFixed(3)}
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              {m.desc}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(34,197,94,0.12)",
                color: "#16A34A",
              }}
            >
              ✓ {m.verdict}
            </span>
          </div>
        ))}
      </div>

      {/* ICC Bar Chart */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>
          강의별 ICC
        </h2>
        <p className="text-caption" style={{ marginBottom: 20 }}>
          같은 강의를 3번 평가했을 때 점수가 얼마나 같은지 보여줘요. 점선(0.75)
          위면 Good 이상이에요.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={RELIABILITY_DATA}
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0.5, 1.0]}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                padding: "12px 16px",
              }}
              formatter={(value) => [Number(value).toFixed(3), "ICC"]}
            />
            <ReferenceLine
              y={0.75}
              stroke="#F59E0B"
              strokeDasharray="6 4"
              label={{
                value: "Good (0.75)",
                fill: "#F59E0B",
                fontSize: 11,
                position: "right",
              }}
            />
            <Bar dataKey="icc" name="ICC" radius={[4, 4, 0, 0]}>
              {RELIABILITY_DATA.map((entry, idx) => (
                <Cell key={idx} fill={iccColor(entry.icc)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Table */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          강의별 상세 메트릭
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["날짜", "ICC", "판정", "Kappa", "Alpha", "SSI"].map((h) => (
                  <th
                    key={h}
                    className="text-label"
                    style={{
                      textAlign: h === "날짜" ? "left" : "center",
                      padding: "12px 8px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RELIABILITY_DATA.map((row, idx) => (
                <tr
                  key={row.date}
                  style={{
                    background:
                      idx % 2 === 1 ? "var(--grey-50)" : "transparent",
                  }}
                >
                  <td
                    className="text-caption"
                    style={{ padding: "12px 8px", fontFamily: "monospace" }}
                  >
                    {row.date}
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 8px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: iccColor(row.icc),
                      }}
                    >
                      {row.icc.toFixed(3)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: `${iccColor(row.icc)}18`,
                        color: iccColor(row.icc),
                      }}
                    >
                      {iccLabel(row.icc)}
                    </span>
                  </td>
                  <td
                    className="text-body"
                    style={{ textAlign: "center", padding: "12px 8px" }}
                  >
                    {row.kappa.toFixed(3)}
                  </td>
                  <td
                    className="text-body"
                    style={{ textAlign: "center", padding: "12px 8px" }}
                  >
                    {row.alpha.toFixed(3)}
                  </td>
                  <td
                    className="text-body"
                    style={{ textAlign: "center", padding: "12px 8px" }}
                  >
                    {row.ssi.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conclusion */}
      <div className="card card-padded" style={{ borderLeft: "3px solid #22C55E" }}>
        <h2 className="text-section" style={{ marginBottom: 8 }}>
          결론
        </h2>
        <p className="text-body">
          GPT-4o-mini는 동일 강의에 대해 <strong>높은 수준의 평가 일관성</strong>을
          보여줘요. 15개 강의 중 <strong>13개(87%)</strong>가 ICC 0.75 이상으로,
          임상 연구에서 "신뢰할 수 있는 측정 도구"로 인정받는 수준이에요.
        </p>
      </div>
    </>
  );
}

// ── 탭 2: 청크 크기 영향 ───────────────────────────────────

function ChunkTab() {
  return (
    <>
      {/* t-test result cards */}
      <div
        className="card-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <div className="card card-padded">
          <span className="text-label">30분 청크 평균</span>
          <p className="text-number" style={{ marginTop: 8 }}>
            {TTEST_RESULTS.mean30.toFixed(2)}
          </p>
        </div>
        <div className="card card-padded">
          <span className="text-label">15분 청크 평균</span>
          <p className="text-number" style={{ marginTop: 8 }}>
            {TTEST_RESULTS.mean15.toFixed(2)}
          </p>
        </div>
        <div className="card card-padded">
          <span className="text-label">p-value</span>
          <p className="text-number" style={{ marginTop: 8, color: "#EF4444" }}>
            {TTEST_RESULTS.p.toFixed(4)}
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(239,68,68,0.12)",
              color: "#DC2626",
            }}
          >
            p &lt; 0.001 유의미
          </span>
        </div>
        <div className="card card-padded">
          <span className="text-label">Cohen's d</span>
          <p className="text-number" style={{ marginTop: 8 }}>
            {TTEST_RESULTS.cohensD.toFixed(2)}
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(139,92,246,0.12)",
              color: "#7C3AED",
            }}
          >
            큰 효과 (large)
          </span>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>
          강의별 점수 비교
        </h2>
        <p className="text-caption" style={{ marginBottom: 20 }}>
          같은 강의를 30분 청크와 15분 청크로 평가한 결과예요.
          대부분 30분 청크 점수가 더 높아요.
        </p>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={CHUNK_COMPARISON}
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[2.5, 3.8]}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                padding: "12px 16px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="chunk30"
              name="30분 청크"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="chunk15"
              name="15분 청크"
              fill="#94A3B8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Difference table */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          강의별 점수 차이
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["날짜", "30분 청크", "15분 청크", "차이"].map((h) => (
                  <th
                    key={h}
                    className="text-label"
                    style={{
                      textAlign: h === "날짜" ? "left" : "center",
                      padding: "12px 8px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHUNK_COMPARISON.map((row, idx) => {
                const diff = row.chunk30 - row.chunk15;
                return (
                  <tr
                    key={row.date}
                    style={{
                      background:
                        idx % 2 === 1 ? "var(--grey-50)" : "transparent",
                    }}
                  >
                    <td
                      className="text-caption"
                      style={{ padding: "12px 8px", fontFamily: "monospace" }}
                    >
                      {row.date}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      <ScoreBadge score={row.chunk30} />
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      <ScoreBadge score={row.chunk15} />
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "12px 8px",
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: diff > 0 ? "#3B82F6" : diff < 0 ? "#EF4444" : "var(--text-tertiary)",
                      }}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats detail */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          통계 검정 상세
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "검정 방법", value: "대응표본 t-test (paired)" },
            {
              label: "t 통계량",
              value: `t(${TTEST_RESULTS.df}) = ${TTEST_RESULTS.t.toFixed(3)}`,
            },
            { label: "p-value", value: TTEST_RESULTS.p.toFixed(6) },
            {
              label: "효과 크기",
              value: `Cohen's d = ${TTEST_RESULTS.cohensD.toFixed(3)} (large)`,
            },
            {
              label: "95% 신뢰구간",
              value: `[${TTEST_RESULTS.ci[0].toFixed(3)}, ${TTEST_RESULTS.ci[1].toFixed(3)}]`,
            },
            { label: "유의수준", value: "α = 0.05" },
          ].map((item) => (
            <div
              key={item.label}
              className="inner-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="text-label">{item.label}</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div className="card card-padded" style={{ borderLeft: "3px solid #EF4444" }}>
        <h2 className="text-section" style={{ marginBottom: 8 }}>
          결론
        </h2>
        <p className="text-body">
          청크 크기가 평가 점수에 <strong>유의미한 영향</strong>을 줘요
          (p&lt;0.001). 30분 청크가 15분보다 평균 <strong>+0.21점</strong> 높았어요.
          이는 30분 청크가 더 넓은 맥락을 담고 있어서 LLM이 강의 흐름을 더 잘
          파악할 수 있기 때문이에요. <strong>비교 분석 시 반드시 같은 청크 크기를
          사용해야 해요.</strong>
        </p>
      </div>
    </>
  );
}
