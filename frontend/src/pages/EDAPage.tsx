import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend,
} from "recharts";
import { formatDateShort } from "@/lib/utils";
import {
  getTranscriptStats, getSpeakerDistribution, getFillerWords,
  getInteractionMetrics, getCurriculumFlow,
  getOpusAnalysis, getOpusFillerAnalysis, getOpusInteractionAnalysis,
} from "@/lib/data";
import AiSummary from "@/components/shared/AiSummary";
import InsightCard from "@/components/shared/InsightCard";
import type {
  TranscriptStats, SpeakerDistribution, FillerWordStats,
  InteractionMetrics, CurriculumEntry,
} from "@/types/evaluation";

type TabKey = "overview" | "speakers" | "interaction" | "filler" | "curriculum" | "ai";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "발화량 분석" },
  { key: "speakers", label: "화자 구성" },
  { key: "interaction", label: "소통 빈도" },
  { key: "filler", label: "습관 표현" },
  { key: "curriculum", label: "수업 흐름" },
  { key: "ai", label: "AI 심층 분석" },
];

const SUBJECT_COLORS: Record<string, string> = {
  "객체지향 프로그래밍": "#8B5CF6",
  "Front-End Programming": "#3182F6",
  "Back-End Programming": "var(--primary)",
};

const CHART_TOOLTIP = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-inner)",
  fontSize: 13,
};

export default function EDAPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [stats, setStats] = useState<TranscriptStats[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerDistribution[]>([]);
  const [fillerWords, setFillerWords] = useState<FillerWordStats[]>([]);
  const [interactions, setInteractions] = useState<InteractionMetrics[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumEntry[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [opusAnalysis, setOpusAnalysis] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [opusFiller, setOpusFiller] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [opusInteraction, setOpusInteraction] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAi, setShowAi] = useState(true);

  useEffect(() => {
    Promise.all([
      getTranscriptStats(), getSpeakerDistribution(), getFillerWords(),
      getInteractionMetrics(), getCurriculumFlow(),
      getOpusAnalysis(), getOpusFillerAnalysis(), getOpusInteractionAnalysis(),
    ])
      .then(([s, sp, f, i, c, oa, of_, oi]) => {
        setStats(s); setSpeakers(sp); setFillerWords(f);
        setInteractions(i); setCurriculum(c);
        setOpusAnalysis(oa); setOpusFiller(of_); setOpusInteraction(oi);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-title">강의 데이터 분석</h1>
          <p className="text-caption mt-1">15개 강의 STT 트랜스크립트에서 추출한 정량 분석 결과</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-[12px] text-text-muted">AI 해석 표시</span>
          <button
            type="button"
            role="switch"
            aria-checked={showAi}
            onClick={() => setShowAi(!showAi)}
            className="toggle"
          >
            <span className="toggle-knob" />
          </button>
        </label>
      </div>

      <div className="tab-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="tab-item"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "overview" && <OverviewTab data={stats} showAi={showAi} />}
        {activeTab === "speakers" && <SpeakersTab data={speakers} showAi={showAi} />}
        {activeTab === "interaction" && <InteractionTab data={interactions} showAi={showAi} />}
        {activeTab === "filler" && <FillerTab data={fillerWords} showAi={showAi} />}
        {activeTab === "curriculum" && <CurriculumTab data={curriculum} showAi={showAi} />}
        {activeTab === "ai" && (
          <AiDeepTab
            analysis={opusAnalysis}
            fillerData={opusFiller}
            interactionData={opusInteraction}
          />
        )}
      </div>
    </div>
  );
}

/* ─── 발화량 분석 ─── */
function OverviewTab({ data, showAi }: { data: TranscriptStats[]; showAi: boolean }) {
  const totalLines = data.reduce((s, d) => s + d.line_count, 0);
  const avgLines = data.length > 0 ? Math.round(totalLines / data.length) : 0;
  const maxEntry = data.reduce((m, d) => (d.line_count > m.line_count ? d : m), data[0]);
  const minEntry = data.reduce((m, d) => (d.line_count < m.line_count ? d : m), data[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AiSummary
        text="15일간 약 2.3만 줄이 기록되었으며, 일 평균 1,500줄 수준으로 안정적인 분석 표본입니다."
        show={showAi}
      />

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <InsightCard label="총 발화량" value={`${totalLines.toLocaleString()}줄`} />
        <InsightCard label="일 평균" value={`${avgLines.toLocaleString()}줄`} />
        <InsightCard label="가장 많은 날" value={`${maxEntry?.line_count.toLocaleString()}줄`} />
        <InsightCard label="가장 적은 날" value={`${minEntry?.line_count.toLocaleString()}줄`} />
      </div>

      <div className="card card-padded">
        <h3 className="text-section mb-1">날짜별 발화량</h3>
        <p className="text-caption mb-6">STT 트랜스크립트 기준 라인 수</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false} tickLine={false} width={45} />
            <Tooltip contentStyle={CHART_TOOLTIP}
              labelFormatter={(l) => formatDateShort(l as string)} />
            <Bar dataKey="line_count" name="라인 수" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.date}
                  fill={entry.line_count < 1200 ? "var(--score-3)" : "var(--primary)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── 화자 구성 ─── */
function SpeakersTab({ data, showAi }: { data: SpeakerDistribution[]; showAi: boolean }) {
  const totalLines = data.reduce(
    (sum, d) => sum + Object.values(d.speakers).reduce((s, v) => s + v, 0), 0
  );
  const mainLines = data.reduce((sum, d) => sum + (d.speakers["주강사"] ?? 0), 0);
  const mainRatio = totalLines > 0 ? ((mainLines / totalLines) * 100).toFixed(1) : "0";
  const multiCount = data.filter((d) => Object.keys(d.speakers).length > 1).length;
  const soloCount = data.length - multiCount;

  const chartData = data.map((d) => ({
    date: d.date,
    주강사: d.speakers["주강사"] ?? 0,
    보조강사: (d.speakers["보조강사1"] ?? 0) + (d.speakers["보조강사2"] ?? 0),
    기타: d.speakers["기타"] ?? 0,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AiSummary
        text="전체 강의의 67%가 단독 수업이며, 주강사 발화 비율이 높은 편입니다."
        show={showAi}
      />

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <InsightCard label="주강사 비율" value={`${mainRatio}%`} />
        <InsightCard label="공동 수업" value={`${multiCount}개`} />
        <InsightCard label="단독 강의" value={`${soloCount}개`} />
      </div>

      <div className="card card-padded">
        <h3 className="text-section mb-1">발화 분포</h3>
        <p className="text-caption mb-6">강의별 주강사 / 보조강사 비율</p>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false} tickLine={false} width={45} />
            <Tooltip contentStyle={CHART_TOOLTIP}
              labelFormatter={(l) => formatDateShort(l as string)} />
            <Legend />
            <Bar dataKey="주강사" stackId="a" fill="var(--primary)" />
            <Bar dataKey="보조강사" stackId="a" fill="var(--score-3)" />
            <Bar dataKey="기타" stackId="a" fill="var(--grey-300)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── 소통 빈도 ─── */
function InteractionTab({ data, showAi }: { data: InteractionMetrics[]; showAi: boolean }) {
  const totalQ = data.reduce((s, d) => s + d.question_count, 0);
  const totalCheck = data.reduce((s, d) => s + d.understanding_check_count, 0);
  const avgQ = data.length > 0 ? (totalQ / data.length).toFixed(1) : "0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AiSummary
        text="질문과 이해도 확인이 활발하여, 강사가 적극적으로 소통하고 있습니다."
        show={showAi}
      />

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <InsightCard label="질문 총 횟수" value={`${totalQ}회`} />
        <InsightCard label="이해도 확인" value={`${totalCheck}회`} />
        <InsightCard label="강의당 평균 질문" value={`${avgQ}회`} />
      </div>

      <div className="card card-padded">
        <h3 className="text-section mb-1">소통 지표 추이</h3>
        <p className="text-caption mb-6">날짜별 질문, 이해도 확인, 참여 유도 빈도</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={CHART_TOOLTIP}
              labelFormatter={(l) => formatDateShort(l as string)} />
            <Legend />
            <Bar dataKey="question_count" name="질문" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="understanding_check_count" name="이해도 확인" fill="var(--score-2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="participation_prompts" name="참여 유도" fill="var(--grey-400)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── 습관 표현 ─── */
function FillerTab({ data, showAi }: { data: FillerWordStats[]; showAi: boolean }) {
  const totalByWord = data.reduce((acc, d) => {
    Object.entries(d.words).forEach(([word, count]) => {
      acc[word] = (acc[word] ?? 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(totalByWord).sort((a, b) => b[1] - a[1]);
  const pieData = sorted.map(([name, value]) => ({ name, value }));
  const COLORS = ["var(--primary)", "var(--score-3)", "var(--score-2)", "var(--score-1)", "var(--grey-400)"];
  const totalAll = sorted.reduce((s, [, c]) => s + c, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AiSummary
        text="'자', '그래서', '이제' 순으로 습관 표현이 빈번합니다."
        show={showAi}
      />

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {sorted.map(([word, count]) => (
          <InsightCard key={word} label={`"${word}"`} value={count.toLocaleString()} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card card-padded">
          <h3 className="text-section mb-1">습관어 비율</h3>
          <p className="text-caption mb-6">전체 {totalAll.toLocaleString()}회 합산</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={3}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padded">
          <h3 className="text-section mb-1">날짜별 총량</h3>
          <p className="text-caption mb-6">습관어 사용 빈도 추이</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDateShort}
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={CHART_TOOLTIP}
                labelFormatter={(l) => formatDateShort(l as string)} />
              <Bar dataKey="total" name="합계" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── 수업 흐름 ─── */
function CurriculumTab({ data, showAi }: { data: CurriculumEntry[]; showAi: boolean }) {
  const groups: { subject: string; color: string; entries: CurriculumEntry[] }[] = [];
  data.forEach((entry) => {
    const last = groups[groups.length - 1];
    if (last && last.subject === entry.subject) {
      last.entries.push(entry);
    } else {
      groups.push({
        subject: entry.subject,
        color: SUBJECT_COLORS[entry.subject] ?? "var(--text-tertiary)",
        entries: [entry],
      });
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AiSummary
        text="프론트엔드 중심의 9일 과정 후 백엔드로 전환되는 구조입니다."
        show={showAi}
      />

      {/* 상단 요약 카드 */}
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {groups.map((g) => (
          <InsightCard key={g.subject} label={g.subject} value={`${g.entries.length}일`} />
        ))}
      </div>

      {/* 상세 일정 */}
      <div className="card card-padded">
        <h3 className="text-section mb-1">전체 수업 일정</h3>
        <p className="text-caption mb-6">
          {data.length}일간 {groups.length}개 과목 진행
        </p>

        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.subject} className="inner-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: group.color }} />
                <span className="text-[15px] font-bold text-foreground">{group.subject}</span>
                <span className="text-caption">{group.entries.length}일</span>
              </div>

              <div className="space-y-2.5">
                {group.entries.map((entry) => (
                  <div key={entry.date} className="flex items-start gap-4">
                    <span className="text-[13px] font-mono text-text-muted w-12 shrink-0 pt-0.5">
                      {formatDateShort(entry.date)}
                    </span>
                    <p className="text-body">{entry.contents.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── AI 심층 분석 ─── */
function AiDeepTab({
  analysis,
  fillerData,
  interactionData,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillerData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interactionData: any[];
}) {
  const [expandedLecture, setExpandedLecture] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="card card-padded" style={{ textAlign: "center", padding: "64px 0" }}>
        <p className="text-body">AI 심층 분석 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const lectures = analysis.lectures ?? [];
  const priorities = analysis.improvement_priorities ?? [];
  const strongest = analysis.strongest_lecture;
  const weakest = analysis.weakest_lecture;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* 1. 전체 요약 */}
      <div className="ai-insight">
        <p className="text-label" style={{ marginBottom: 8 }}>전체 요약</p>
        <p className="text-body" style={{ lineHeight: 1.8 }}>{analysis.overall_summary}</p>
      </div>

      {/* 2. 강의별 분석 */}
      <div>
        <h3 className="text-section" style={{ marginBottom: 16 }}>강의별 분석</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {lectures.map((lec: any) => {
            const isOpen = expandedLecture === lec.date;
            return (
              <div key={lec.date} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedLecture(isOpen ? null : lec.date)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left transition-colors"
                  style={{ padding: "16px 24px" }}
                >
                  <div>
                    <p className="font-bold" style={{ fontSize: 14, color: "var(--text-primary)" }}>
                      {lec.date} &middot; {lec.subject}
                    </p>
                    <p className="text-caption" style={{ marginTop: 4 }}>
                      {lec.content_summary?.slice(0, 80)}...
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--text-muted)", marginLeft: 16 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="inner-card">
                      <p className="text-label" style={{ marginBottom: 6 }}>내용 요약</p>
                      <p className="text-body" style={{ lineHeight: 1.7 }}>{lec.content_summary}</p>
                    </div>

                    <div className="inner-card">
                      <p className="text-label" style={{ marginBottom: 6 }}>강의 스타일</p>
                      <p className="text-body" style={{ lineHeight: 1.7 }}>{lec.teaching_style}</p>
                    </div>

                    {lec.notable_patterns?.length > 0 && (
                      <div className="inner-card">
                        <p className="text-label" style={{ marginBottom: 8 }}>주요 패턴</p>
                        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                          {lec.notable_patterns.map((p: string, i: number) => (
                            <li key={i} className="text-body">{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                      <div className="inner-card">
                        <p className="text-label" style={{ marginBottom: 6 }}>도입 품질</p>
                        <p className="text-body" style={{ lineHeight: 1.7 }}>{lec.opening_quality}</p>
                      </div>
                      <div className="inner-card">
                        <p className="text-label" style={{ marginBottom: 6 }}>마무리 품질</p>
                        <p className="text-body" style={{ lineHeight: 1.7 }}>{lec.closing_quality}</p>
                      </div>
                      <div className="inner-card">
                        <p className="text-label" style={{ marginBottom: 6 }}>소통 품질</p>
                        <p className="text-body" style={{ lineHeight: 1.7 }}>{lec.interaction_quality}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 습관 표현 심층 분석 */}
      <div>
        <h3 className="text-section" style={{ marginBottom: 16 }}>습관 표현 심층 분석</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fillerData.map((entry: any) => (
            <div key={entry.date} className="card card-padded">
              <p className="font-bold" style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 12 }}>
                {entry.date}
              </p>

              {entry.habitual_phrases?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {entry.habitual_phrases.map((hp: any, i: number) => (
                    <div key={i} className="inner-card">
                      <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                        <span className="font-semibold" style={{ fontSize: 13, color: "var(--primary)" }}>
                          &ldquo;{hp.phrase}&rdquo;
                        </span>
                        <span className="text-caption">{hp.estimated_frequency}</span>
                      </div>
                      <p className="text-body" style={{ lineHeight: 1.6 }}>{hp.context}</p>
                    </div>
                  ))}
                </div>
              )}

              {entry.speech_characteristics && (
                <div className="ai-insight">
                  <p className="text-label" style={{ marginBottom: 4 }}>발화 특성</p>
                  <p className="text-body" style={{ lineHeight: 1.7 }}>{entry.speech_characteristics}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. 소통 품질 분석 */}
      <div>
        <h3 className="text-section" style={{ marginBottom: 16 }}>소통 품질 분석</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {interactionData.map((entry: any) => (
            <div key={entry.date} className="card card-padded">
              <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <p className="font-bold" style={{ fontSize: 14, color: "var(--text-primary)" }}>
                  {entry.date}
                </p>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    background: "var(--surface)",
                    borderRadius: 6,
                    padding: "2px 10px",
                  }}
                >
                  {entry.interaction_type}
                </span>
              </div>

              <p className="text-body" style={{ lineHeight: 1.7, marginBottom: 12 }}>{entry.assessment}</p>

              {entry.check_phrases_found?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {entry.check_phrases_found.map((phrase: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        background: "var(--surface)",
                        borderRadius: 6,
                        padding: "3px 10px",
                      }}
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. 개선 우선순위 */}
      {priorities.length > 0 && (
        <div>
          <h3 className="text-section" style={{ marginBottom: 16 }}>개선 우선순위</h3>
          <div className="card card-padded">
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {priorities.map((item: string, i: number) => (
                <li key={i} className="text-body" style={{ lineHeight: 1.7 }}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* 6. 최고 / 최저 강의 */}
      {(strongest || weakest) && (
        <div>
          <h3 className="text-section" style={{ marginBottom: 16 }}>최고 / 최저 강의</h3>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {strongest && (
              <div className="card card-padded">
                <p className="text-label" style={{ marginBottom: 8, color: "var(--primary)" }}>
                  최고 강의
                </p>
                <p className="font-bold" style={{ fontSize: 15, color: "var(--text-primary)", marginBottom: 8 }}>
                  {strongest.date}
                </p>
                <p className="text-body" style={{ lineHeight: 1.7 }}>{strongest.reason}</p>
              </div>
            )}
            {weakest && (
              <div className="card card-padded">
                <p className="text-label" style={{ marginBottom: 8, color: "var(--score-3)" }}>
                  최저 강의
                </p>
                <p className="font-bold" style={{ fontSize: 15, color: "var(--text-primary)", marginBottom: 8 }}>
                  {weakest.date}
                </p>
                <p className="text-body" style={{ lineHeight: 1.7 }}>{weakest.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
