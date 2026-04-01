import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Brain, ChevronRight, Sparkles, TriangleAlert } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { getEvaluationByModel, getSimulation, getSimulationColors, getSimulationSummaryVisual, MODEL_LABELS, type ModelKey } from "@/lib/data";
import { formatDate, scoreColor, scoreBadgeTextColor, scoreLabel, weightLabel } from "@/lib/utils";
import { exportToNotion } from "@/lib/api";
import BrainCanvas from "@/components/simulation/BrainCanvas";
import ScoreBadge from "@/components/shared/ScoreBadge";
import FeedbackCard from "@/components/shared/FeedbackCard";
import type { EvaluationResult, CategoryResult, ItemScore } from "@/types/evaluation";
import type { BrainIconFramePayload, SegmentColorPayload, SimulationResult } from "@/types/simulation";

export default function LectureDetailPage() {
  const params = useParams();
  const date = params.date ?? "";
  const { isOperator } = useRole();
  const [model, setModel] = useState<ModelKey>("gpt4o-mini");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [summaryVisual, setSummaryVisual] = useState<BrainIconFramePayload | null>(null);
  const [segmentColors, setSegmentColors] = useState<SegmentColorPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      .then(async (result) => {
        const [visual, colorPayload] = await Promise.all([
          result.summary_visual ? getSimulationSummaryVisual(result.summary_visual.brain_icon_frames_json) : Promise.resolve(null),
          getSimulationColors(result.assets.segment_colors_json),
        ]);
        if (cancelled) return;
        setSimulation(result);
        setSummaryVisual(visual);
        setSegmentColors(colorPayload);
      })
      .catch(() => {
        if (!cancelled) {
          setSimulation(null);
          setSummaryVisual(null);
          setSegmentColors(null);
        }
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
  const firstSummaryFrame = summaryVisual?.frames[0] ?? null;
  const firstColorSegment =
    segmentColors && firstSummaryFrame
      ? segmentColors.segments.find((segment) => segment.segment_id === firstSummaryFrame.segment_id) ?? null
      : null;

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

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Model Selector */}
      <div className="tab-bar" role="tablist" style={{ marginBottom: 16 }}>
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

        {/* 노션 내보내기 */}
        <NotionExportButton
          lectureDate={evaluation.lecture_date}
          score={weighted_average}
          model={model}
          subject={metadata.subjects?.[0] ?? ""}
          strengths={evaluation.strengths ?? []}
          improvements={evaluation.improvements ?? []}
          recommendations={evaluation.recommendations ?? []}
        />
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

      <div className="card card-padded">
        <div className="simulation-panel-header">
          <div>
            <p className="text-section">실험: 수강자 반응 시뮬레이션</p>
            <p className="text-caption">한 줄 결론부터 보고, 실시간 보기에서 스크립트와 반응을 같이 따라갈 수 있어요.</p>
          </div>
        </div>
        {simulation && firstSummaryFrame ? (
          <div className="lecture-simulation-card-body">
            <div className="lecture-simulation-card-visual">
              {firstColorSegment ? (
                <BrainCanvas
                  meshUrl={simulation.assets.mesh_glb}
                  colors={firstColorSegment.hemispheres}
                  intensity={Math.min(1, 0.54 + firstSummaryFrame.proxies.attention / 140)}
                  changeBoost={Math.min(1, 0.42 + firstSummaryFrame.proxies.novelty / 140)}
                  variant="summary"
                />
              ) : null}
            </div>
            <div className="lecture-simulation-card-copy">
              <div className="simulation-pill-row">
                <span className="simulation-pill simulation-pill-primary">
                  <Sparkles size={14} />
                  빠르게 보는 요약
                </span>
                <span className="simulation-pill">
                  <Brain size={14} />
                  실시간 Deep View 지원
                </span>
              </div>
              <p className="text-section" style={{ marginTop: 14 }}>{simulation.summary_visual?.hero_statement}</p>
              <p className="text-body" style={{ marginTop: 10 }}>{simulation.lecture_summary.summary_text}</p>
              <div className="simulation-pill-row" style={{ marginTop: 14 }}>
                <span className="simulation-pill">강한 구간 {simulation.lecture_summary.strongest_segment_ids.length}개</span>
                <span className="simulation-pill">주의 구간 {simulation.lecture_summary.risk_segment_ids.length}개</span>
                <span className="simulation-pill">{simulation.segments.length}개 세그먼트</span>
              </div>
              <div className="simulation-callout" style={{ marginTop: 16 }}>
                <TriangleAlert size={16} />
                <p>{simulation.lecture_summary.caution_text}</p>
              </div>
            </div>
            <div className="lecture-simulation-card-actions">
              <Link to={`/lectures/${date}/simulation`} className="btn-secondary">
                요약 보기
                <ChevronRight size={16} />
              </Link>
              <Link to={`/lectures/${date}/simulation/live`} className="btn-primary">
                실시간 보기
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="simulation-pill-row" style={{ marginTop: 16 }}>
            <span className="simulation-pill">요약 인포그래픽</span>
            <span className="simulation-pill">실시간 3D</span>
            <span className="simulation-pill">원문 동기화</span>
          </div>
        )}
      </div>
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


/* ─── 노션 내보내기 버튼 ─── */

function NotionExportButton({
  lectureDate,
  score,
  model,
  subject,
  strengths,
  improvements,
  recommendations,
}: {
  lectureDate: string;
  score: number;
  model: string;
  subject: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [notionUrl, setNotionUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isConnected = !!localStorage.getItem("notion-integration");

  const handleExport = useCallback(async () => {
    const stored = localStorage.getItem("notion-integration");
    if (!stored) {
      navigate("/integrations");
      return;
    }

    let token = "";
    let databaseId = "";
    try {
      const parsed = JSON.parse(stored);
      token = parsed.token ?? "";
      databaseId = parsed.database_id ?? "";
    } catch {
      setErrorMsg("노션 연동 정보가 올바르지 않아요");
      setStatus("error");
      return;
    }

    if (!token || !databaseId) {
      setErrorMsg("노션 토큰 또는 데이터베이스 ID가 없어요");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const result = await exportToNotion({
        token,
        database_id: databaseId,
        lecture_date: lectureDate,
        score,
        model,
        subject,
        strengths,
        improvements,
        recommendations,
      });

      if (result.success && result.url) {
        setNotionUrl(result.url);
        setStatus("success");
      } else {
        setErrorMsg(result.error || "노션에 저장하지 못했어요");
        setStatus("error");
      }
    } catch {
      setErrorMsg("네트워크 오류가 발생했어요");
      setStatus("error");
    }
  }, [lectureDate, score, model, subject, strengths, improvements, recommendations]);

  if (status === "success" && notionUrl) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 20,
          padding: "14px 20px",
          background: "var(--primary-light)",
          borderRadius: "var(--radius-inner)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--primary)",
            flexShrink: 0,
          }}
        />
        <span className="text-body" style={{ flex: 1, color: "var(--text-primary)", fontWeight: 600 }}>
          노션에 저장했어요
        </span>
        <a
          href={notionUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          노션에서 보기 →
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
      <button
        onClick={isConnected ? handleExport : () => navigate("/integrations")}
        disabled={status === "loading"}
        className="btn-primary"
        style={{ fontSize: 13, padding: "10px 18px" }}
      >
        {status === "loading"
          ? "저장 중..."
          : isConnected
          ? "노션에 저장하기"
          : "노션 연결하기"}
      </button>
      {status === "error" && (
        <span className="text-caption" style={{ color: "var(--primary)" }}>
          {errorMsg}
        </span>
      )}
    </div>
  );
}
