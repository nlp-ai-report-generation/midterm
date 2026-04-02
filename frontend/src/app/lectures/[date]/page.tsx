import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FileText, Download } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { getEvaluationByModel, getSimulation, MODEL_LABELS, type ModelKey } from "@/lib/data";
import { formatDate, scoreColor, scoreLabel, weightLabel } from "@/lib/utils";
import { exportReportToNotion, uploadToDrive } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import ScoreBadge from "@/components/shared/ScoreBadge";
import FeedbackCard from "@/components/shared/FeedbackCard";
import type { EvaluationResult, CategoryResult, ItemScore } from "@/types/evaluation";
import type { SimulationResult } from "@/types/simulation";

const SimulationView = lazy(() => import("@/components/simulation/SimulationView"));

export default function LectureDetailPage() {
  const params = useParams();
  const date = params.date ?? "";
  const { isOperator } = useRole();
  const [model, setModel] = useState<ModelKey>("gpt4o-mini");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"eval" | "sim" | "report">("eval");
  const [simLoaded, setSimLoaded] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError(false);
    getEvaluationByModel(date, model)
      .then(setEvaluation)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [date, model]);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;

    getSimulation(date)
      .then((result) => {
        if (!cancelled) setSimulation(result);
      })
      .catch(() => {
        if (!cancelled) setSimulation(null);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="card" style={{ padding: "80px 0", textAlign: "center" }}>
          <p className="text-body">평가 데이터를 불러오지 못했어요</p>
          <Link
            to="/lectures"
            className="inline-block font-semibold"
            style={{ marginTop: 16, fontSize: 14, color: "var(--primary)" }}
          >
            &larr; 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const {
    metadata,
    weighted_average,
    category_results,
    category_averages,
    strengths,
    improvements,
    recommendations,
  } = evaluation;

  const radarData = Object.entries(category_averages).map(([name, value]) => ({
    category: name.replace(/^\d+\.\s*/, "").slice(0, 6),
    fullName: name,
    score: value,
    fullMark: 5,
  }));
  // Role-dependent feedback config
  const feedbackConfig = isOperator
    ? {
        strengthTitle: "잘한 점",
        strengthSubtitle: "이 강의에서 높은 평가를 받은 영역이에요",
        improvementTitle: "개선할 점",
        improvementSubtitle: "보완하면 더 좋아질 수 있어요",
        recommendationTitle: "추천 액션",
        recommendationSubtitle: "품질을 높이기 위해 해볼 수 있는 것들이에요",
      }
    : {
        strengthTitle: "잘하고 있는 부분",
        strengthSubtitle: "이 강의에서 효과적이었던 점이에요",
        improvementTitle: "더 나아질 수 있는 부분",
        improvementSubtitle: "다음 수업에서 시도해볼 수 있는 변화예요",
        recommendationTitle: "구체적 제안",
        recommendationSubtitle: "바로 실행할 수 있는 다음 단계를 정리했어요",
      };

  // Lazy-load simulation tab on first click
  const handleTabChange = (t: "eval" | "sim" | "report") => {
    setTab(t);
    if (t === "sim") setSimLoaded(true);
  };

  // Report helpers (inline instead of modal)
  const reportMarkdown = buildReportMarkdown({
    lectureDate: evaluation.lecture_date,
    subject: metadata.subjects?.[0] ?? "",
    instructor: metadata.instructor ?? "",
    score: weighted_average,
    model,
    categories: category_results.map((c: CategoryResult) => ({ name: c.category_name, score: c.weighted_average })),
    strengths: strengths ?? [],
    improvements: improvements ?? [],
    recommendations: recommendations ?? [],
    simulationSummary: simulation?.lecture_summary?.summary_text,
  });

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="card card-padded">
        <Link
          to="/lectures"
          className="inline-flex items-center gap-1 text-caption hover:text-primary"
          style={{ marginBottom: 20 }}
        >
          &larr; 강의 목록
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-title">{metadata.subjects?.[0] ?? "강의"}</h1>
            <p className="text-body" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {metadata.contents?.[0] ?? ""}
            </p>
            <div
              className="flex items-center gap-2 text-caption"
              style={{ marginTop: 12 }}
            >
              <span>{formatDate(evaluation.lecture_date)}</span>
              {metadata.instructor && (
                <>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span>{metadata.instructor}</span>
                </>
              )}
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span>{MODEL_LABELS[model]}</span>
            </div>
          </div>

          <div style={{ textAlign: "right", paddingLeft: 32 }}>
            <p className="text-caption" style={{ marginBottom: 4 }}>종합 점수</p>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: scoreColor(weighted_average),
              }}
            >
              {weighted_average.toFixed(1)}
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              {scoreLabel(weighted_average)} · 5점 만점
            </p>
          </div>
        </div>
      </div>

      {/* ─── Page Tabs ─── */}
      <div className="tab-bar" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "eval"}
          onClick={() => handleTabChange("eval")}
          className="tab-item"
        >
          평가
        </button>
        <button
          role="tab"
          aria-selected={tab === "sim"}
          onClick={() => handleTabChange("sim")}
          className="tab-item"
        >
          시뮬레이션
        </button>
        <button
          role="tab"
          aria-selected={tab === "report"}
          onClick={() => handleTabChange("report")}
          className="tab-item"
        >
          리포트
        </button>
      </div>

      {/* ─── Tab: 평가 ─── */}
      {tab === "eval" && (
        <>
          {/* Model Selector */}
          <div className="tab-bar" role="tablist" style={{ marginBottom: 0 }}>
            {(["gpt4o-mini", "opus", "sonnet"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={model === m}
                onClick={() => setModel(m)}
                className="tab-item"
              >
                {MODEL_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="card card-padded">
            <h2 className="text-section" style={{ marginBottom: 4 }}>카테고리별 점수</h2>
            <p className="text-caption" style={{ marginBottom: 24 }}>넓을수록 균형 잡힌 강의예요. 안쪽으로 들어간 영역이 개선 포인트예요</p>
            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "var(--grey-700)", fontSize: 13, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <div
                          className="card"
                          style={{ padding: "12px 16px", boxShadow: "var(--shadow-hover)" }}
                        >
                          <p
                            className="font-semibold"
                            style={{ fontSize: 13, color: "var(--text-primary)" }}
                          >
                            {d.fullName}
                          </p>
                          <p
                            className="font-bold"
                            style={{ fontSize: 18, marginTop: 4, color: scoreColor(d.score) }}
                          >
                            {d.score.toFixed(2)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Detail */}
          <div>
            <h2 className="text-section" style={{ marginBottom: 20 }}>카테고리별 상세 평가</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {category_results.map((cat) => (
                <CategorySection key={cat.category_name} category={cat} />
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FeedbackCard
              title={feedbackConfig.strengthTitle}
              subtitle={feedbackConfig.strengthSubtitle}
              items={strengths}
              color="var(--primary)"
            />
            <FeedbackCard
              title={feedbackConfig.improvementTitle}
              subtitle={feedbackConfig.improvementSubtitle}
              items={improvements}
              color="var(--score-3)"
            />
            <FeedbackCard
              title={feedbackConfig.recommendationTitle}
              subtitle={feedbackConfig.recommendationSubtitle}
              items={recommendations}
              color="var(--grey-500)"
            />
          </div>
        </>
      )}

      {/* ─── Tab: 시뮬레이션 ─── */}
      {tab === "sim" && (
        <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
          {simLoaded && <SimulationView date={date} />}
        </Suspense>
      )}

      {/* ─── Tab: 리포트 ─── */}
      {tab === "report" && (
        <ReportInline
          lectureDate={evaluation.lecture_date}
          subject={metadata.subjects?.[0] ?? ""}
          instructor={metadata.instructor ?? ""}
          score={weighted_average}
          model={model}
          categories={category_results.map((c: CategoryResult) => ({ name: c.category_name, score: c.weighted_average }))}
          strengths={strengths ?? []}
          improvements={improvements ?? []}
          recommendations={recommendations ?? []}
          simulationSummary={simulation?.lecture_summary?.summary_text}
          reportMarkdown={reportMarkdown}
        />
      )}
    </div>
  );
}

/* ─── Category Accordion ─── */

function CategorySection({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left transition-colors"
        style={{ padding: "20px 28px" }}
      >
        <div className="flex items-center gap-5">
          <ScoreBadge score={category.weighted_average} size="lg" className="shrink-0 font-extrabold" />
          <div>
            <p
              className="font-bold"
              style={{ fontSize: 15, color: "var(--text-primary)" }}
            >
              {category.category_name}
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              {category.items.length}개 항목 · {scoreLabel(category.weighted_average)}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "8px 28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {category.items.map((item) => (
            <ItemScoreCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Item Score Card ─── */

function ItemScoreCard({ item }: { item: ItemScore }) {
  return (
    <div className="inner-card">
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 font-mono"
            style={{ fontSize: 12, color: "var(--text-muted)" }}
          >
            {item.item_id}
          </span>
          <span
            className="truncate font-semibold"
            style={{ fontSize: 14, color: "var(--text-primary)" }}
          >
            {item.item_name}
          </span>
          <span
            className="shrink-0"
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              background: "var(--surface)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            {weightLabel(item.weight)}
          </span>
        </div>
        <ScoreBadge score={item.score} size="sm" className="shrink-0 ml-4" />
      </div>

      <p className="text-body" style={{ lineHeight: 1.7 }}>{item.reasoning}</p>

      {item.evidence.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="text-label" style={{ marginBottom: 8 }}>근거</p>
          {item.evidence.map((e, i) => (
            <div key={i} className="evidence-card">
              <p className="text-body italic" style={{ lineHeight: 1.7 }}>
                &ldquo;{e}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ─── Report Inline (replaces modal) ─── */

interface ReportInlineProps {
  lectureDate: string;
  subject: string;
  instructor: string;
  score: number;
  model: string;
  categories: Array<{ name: string; score: number }>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  simulationSummary?: string;
  reportMarkdown: string;
}

function ReportInline({
  lectureDate,
  subject,
  instructor,
  score,
  model,
  categories,
  strengths,
  improvements,
  recommendations,
  simulationSummary,
  reportMarkdown,
}: ReportInlineProps) {
  const [exporting, setExporting] = useState<"notion" | "drive" | null>(null);
  const [message, setMessage] = useState("");

  const handleDownload = useCallback(() => {
    const blob = new Blob([reportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lectureDate}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reportMarkdown, lectureDate]);

  const handleNotionExport = useCallback(async () => {
    const stored = localStorage.getItem("notion-integration");
    if (!stored) { setMessage("Notion 연동을 먼저 설정해주세요"); return; }
    const { token, database_id } = JSON.parse(stored);
    setExporting("notion");
    setMessage("");
    try {
      const result = await exportReportToNotion({
        token, database_id, lecture_date: lectureDate,
        score, model, subject, report_markdown: reportMarkdown,
        strengths, improvements, recommendations, simulation_summary: simulationSummary,
      });
      setMessage(result.success ? "Notion에 저장했습니다" : result.error || "저장 실패");
    } catch { setMessage("Notion 내보내기 실패"); }
    finally { setExporting(null); }
  }, [lectureDate, score, model, subject, reportMarkdown, strengths, improvements, recommendations, simulationSummary]);

  const handleDriveExport = useCallback(async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.provider_token;
    if (!token) { setMessage("Google 로그인이 필요합니다"); return; }
    setExporting("drive");
    setMessage("");
    try {
      const result = await uploadToDrive({
        token, filename: `${lectureDate}-report.md`, content: reportMarkdown,
      });
      setMessage(result.success ? "Drive에 저장했습니다" : result.error || "업로드 실패");
    } catch { setMessage("Drive 업로드 실패"); }
    finally { setExporting(null); }
  }, [lectureDate, reportMarkdown]);

  return (
    <div className="report-inline" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Score */}
      <div className="report-section">
        <p className="report-section-title">종합 점수</p>
        <div className="report-score-row">
          <span className="report-score-value">{score.toFixed(1)}</span>
          <span className="report-score-max">/ 5.0</span>
          <div className="report-score-bar">
            <div className="report-score-fill" style={{ width: `${(score / 5) * 100}%` }} />
          </div>
          <span className="report-score-pct">{Math.round((score / 5) * 100)}%</span>
        </div>
        <p className="text-body" style={{ marginTop: 4 }}>
          {score >= 4.0 ? "전반적으로 우수한 강의예요." : score >= 3.0 ? "괜찮지만 몇 가지 개선할 점이 있어요." : "개선이 필요한 영역이 있어요."}
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="report-section">
          <p className="report-section-title">카테고리별 점수</p>
          <div className="report-categories">
            {categories.map((cat) => (
              <div key={cat.name} className="report-cat-row">
                <span className="report-cat-name">{cat.name}</span>
                <div className="report-cat-bar">
                  <div className="report-cat-fill" style={{ width: `${(cat.score / 5) * 100}%` }} />
                </div>
                <span className="report-cat-score">{cat.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="report-section">
          <div className="report-section-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={`${import.meta.env.BASE_URL}emoji/sparkles.png`} alt="" width={20} height={20} />
            <p className="report-section-title">잘한 점</p>
          </div>
          <ul className="report-list">
            {strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="report-section">
          <p className="report-section-title">개선할 점</p>
          <ul className="report-list">
            {improvements.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="report-section">
          <p className="report-section-title">추천 액션</p>
          <ul className="report-list">
            {recommendations.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Simulation summary */}
      <div className="report-section">
        <div className="report-section-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={`${import.meta.env.BASE_URL}emoji/dna.png`} alt="" width={20} height={20} />
          <p className="report-section-title">뇌 반응 시뮬레이션 요약</p>
        </div>
        <p className="report-sim-text">{simulationSummary || "시뮬레이션 데이터가 아직 준비되지 않았어요."}</p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {message && <span className="report-message text-caption">{message}</span>}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button className="btn-secondary" onClick={handleDownload} disabled={!!exporting}>
            <Download size={14} /> 마크다운
          </button>
          <button className="btn-secondary" onClick={handleDriveExport} disabled={!!exporting}>
            <FileText size={14} /> {exporting === "drive" ? "저장 중..." : "Drive"}
          </button>
          <button className="btn-primary" onClick={handleNotionExport} disabled={!!exporting}>
            {exporting === "notion" ? "저장 중..." : "Notion에 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Build Report Markdown ─── */

function buildReportMarkdown(data: {
  lectureDate: string; subject: string; instructor: string;
  score: number; model: string;
  categories: Array<{ name: string; score: number }>;
  strengths: string[]; improvements: string[]; recommendations: string[];
  simulationSummary?: string;
}): string {
  const lines: string[] = [];
  lines.push(`# ${data.subject} 강의 분석 리포트`);
  lines.push(`\n**날짜**: ${data.lectureDate} | **강사**: ${data.instructor} | **모델**: ${data.model}\n`);
  lines.push(`## 종합 점수: ${data.score.toFixed(1)} / 5.0 (${Math.round((data.score / 5) * 100)}%)\n`);

  if (data.categories.length) {
    lines.push(`## 카테고리별 점수\n`);
    for (const cat of data.categories) {
      lines.push(`- **${cat.name}**: ${cat.score.toFixed(1)}`);
    }
    lines.push("");
  }

  if (data.strengths.length) {
    lines.push(`## 잘한 점\n`);
    for (const s of data.strengths) lines.push(`- ${s}`);
    lines.push("");
  }

  if (data.improvements.length) {
    lines.push(`## 개선할 점\n`);
    for (const s of data.improvements) lines.push(`- ${s}`);
    lines.push("");
  }

  if (data.recommendations.length) {
    lines.push(`## 추천 액션\n`);
    for (const s of data.recommendations) lines.push(`- ${s}`);
    lines.push("");
  }

  if (data.simulationSummary) {
    lines.push(`## 뇌 반응 시뮬레이션 요약\n`);
    lines.push(data.simulationSummary);
    lines.push("");
  }

  return lines.join("\n");
}
