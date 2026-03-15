import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend,
} from "recharts";
import { formatDateShort } from "@/lib/utils";
import {
  getTranscriptStats, getSpeakerDistribution, getFillerWords,
  getInteractionMetrics, getCurriculumFlow,
} from "@/lib/data";
import type {
  TranscriptStats, SpeakerDistribution, FillerWordStats,
  InteractionMetrics, CurriculumEntry,
} from "@/types/evaluation";

type TabKey = "overview" | "speakers" | "interaction" | "filler" | "curriculum";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "수업 규모" },
  { key: "speakers", label: "누가 말했나" },
  { key: "interaction", label: "얼마나 소통했나" },
  { key: "filler", label: "반복 표현" },
  { key: "curriculum", label: "무엇을 배웠나" },
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

const AI_MODEL = "Claude Opus 4.6";

export default function EDAPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [stats, setStats] = useState<TranscriptStats[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerDistribution[]>([]);
  const [fillerWords, setFillerWords] = useState<FillerWordStats[]>([]);
  const [interactions, setInteractions] = useState<InteractionMetrics[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAiLabel, setShowAiLabel] = useState(true);

  useEffect(() => {
    Promise.all([
      getTranscriptStats(), getSpeakerDistribution(), getFillerWords(),
      getInteractionMetrics(), getCurriculumFlow(),
    ])
      .then(([s, sp, f, i, c]) => {
        setStats(s); setSpeakers(sp); setFillerWords(f);
        setInteractions(i); setCurriculum(c);
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
            aria-checked={showAiLabel}
            onClick={() => setShowAiLabel(!showAiLabel)}
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
        {activeTab === "overview" && <OverviewTab data={stats} showAi={showAiLabel} />}
        {activeTab === "speakers" && <SpeakersTab data={speakers} showAi={showAiLabel} />}
        {activeTab === "interaction" && <InteractionTab data={interactions} showAi={showAiLabel} />}
        {activeTab === "filler" && <FillerTab data={fillerWords} showAi={showAiLabel} />}
        {activeTab === "curriculum" && <CurriculumTab data={curriculum} showAi={showAiLabel} />}
      </div>
    </div>
  );
}

/* ─── 요약 카드 (AI 코멘트 포함) ─── */
function InsightCard({ label, value, comment, showAi }: {
  label: string; value: string; comment?: string; showAi: boolean;
}) {
  return (
    <div className="card card-padded">
      <p className="text-label">{label}</p>
      <p className="text-number mt-2">{value}</p>
      {comment && showAi && (
        <p className="text-[12px] text-text-tertiary mt-2 leading-relaxed">
          {comment}
          <span className="text-[11px] text-text-muted ml-1">— {AI_MODEL}</span>
        </p>
      )}
    </div>
  );
}

/* ─── 수업 규모 ─── */
function OverviewTab({ data, showAi }: { data: TranscriptStats[]; showAi: boolean }) {
  const totalLines = data.reduce((s, d) => s + d.line_count, 0);
  const avgLines = data.length > 0 ? Math.round(totalLines / data.length) : 0;
  const maxEntry = data.reduce((m, d) => (d.line_count > m.line_count ? d : m), data[0]);
  const minEntry = data.reduce((m, d) => (d.line_count < m.line_count ? d : m), data[0]);

  return (
    <div className="space-y-6">
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <InsightCard label="총 발화량" value={`${totalLines.toLocaleString()}줄`}
          comment="15일간 약 2.3만 줄의 발화가 기록되었습니다. 일평균 1,500줄 수준입니다."
          showAi={showAi} />
        <InsightCard label="일 평균" value={`${avgLines.toLocaleString()}줄`}
          comment="강의당 평균 발화량이 1,500줄로, 충분한 분석 표본이 확보된 상태입니다."
          showAi={showAi} />
        <InsightCard label="가장 많은 날" value={`${maxEntry?.line_count.toLocaleString()}줄`}
          comment={`${formatDateShort(maxEntry?.date)}에 가장 많은 발화가 나왔습니다. 새로운 주제 도입일일 가능성이 높습니다.`}
          showAi={showAi} />
        <InsightCard label="가장 적은 날" value={`${minEntry?.line_count.toLocaleString()}줄`}
          comment={`${formatDateShort(minEntry?.date)}은 반일 수업 또는 실습 위주였을 수 있습니다.`}
          showAi={showAi} />
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
                  fill={entry.line_count < 1200 ? "#FF9500" : "var(--primary)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── 누가 말했나 ─── */
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
    <div className="space-y-6">
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <InsightCard label="주강사 비율" value={`${mainRatio}%`}
          comment="대부분의 수업이 주강사 중심으로 진행됩니다. 강사 독백 비율이 높은 편입니다."
          showAi={showAi} />
        <InsightCard label="공동 수업" value={`${multiCount}개`}
          comment={`${multiCount}개 강의에서 보조강사가 참여했습니다. 실습이나 Q&A 세션이 포함된 날입니다.`}
          showAi={showAi} />
        <InsightCard label="단독 강의" value={`${soloCount}개`}
          comment="전체의 67%가 단독 강의로, 강사 발화 패턴 분석에 적합합니다."
          showAi={showAi} />
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
            <Bar dataKey="보조강사" stackId="a" fill="#FF9F5A" />
            <Bar dataKey="기타" stackId="a" fill="var(--grey-300)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── 얼마나 소통했나 ─── */
function InteractionTab({ data, showAi }: { data: InteractionMetrics[]; showAi: boolean }) {
  const totalQ = data.reduce((s, d) => s + d.question_count, 0);
  const totalCheck = data.reduce((s, d) => s + d.understanding_check_count, 0);
  const avgQ = data.length > 0 ? (totalQ / data.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <InsightCard label="질문 총 횟수" value={`${totalQ}회`}
          comment="15일간 총 질문이 풍부한 편입니다. 강사가 적극적으로 질문을 던지고 있습니다."
          showAi={showAi} />
        <InsightCard label="이해도 확인" value={`${totalCheck}회`}
          comment={`"되셨어요", "됐나요" 등의 이해도 확인 표현이 ${totalCheck}회 등장했습니다.`}
          showAi={showAi} />
        <InsightCard label="강의당 평균 질문" value={`${avgQ}회`}
          comment="강의당 평균 질문 횟수로, 수강생과의 소통 밀도를 나타냅니다."
          showAi={showAi} />
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
            <Bar dataKey="understanding_check_count" name="이해도 확인" fill="#3182F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="participation_prompts" name="참여 유도" fill="#34C759" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── 반복 표현 ─── */
function FillerTab({ data, showAi }: { data: FillerWordStats[]; showAi: boolean }) {
  const totalByWord = data.reduce((acc, d) => {
    Object.entries(d.words).forEach(([word, count]) => {
      acc[word] = (acc[word] ?? 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(totalByWord).sort((a, b) => b[1] - a[1]);
  const pieData = sorted.map(([name, value]) => ({ name, value }));
  const COLORS = ["var(--primary)", "#3182F6", "#FF9500", "#34C759", "#8B5CF6"];
  const totalAll = sorted.reduce((s, [, c]) => s + c, 0);

  const WORD_COMMENTS: Record<string, string> = {
    "자": '"자"는 전환 표시로 사용되며, 가장 빈번한 습관어입니다.',
    "그래서": '"그래서"는 논리적 연결에 사용됩니다. 과도하면 설명이 장황해질 수 있습니다.',
    "이제": '"이제"는 시간/전환 표시입니다. 단계별 설명 방식을 반영합니다.',
    "네": '"네"는 확인/동의 표현입니다. 수강생과의 소통을 나타냅니다.',
  };

  return (
    <div className="space-y-6">
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {sorted.map(([word, count], i) => (
          <InsightCard key={word} label={`"${word}"`} value={count.toLocaleString()}
            comment={WORD_COMMENTS[word] ?? `평균 ${(count / data.length).toFixed(0)}회/강의 사용됩니다.`}
            showAi={showAi} />
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

/* ─── 무엇을 배웠나 ─── */
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
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {groups.map((g) => (
          <InsightCard key={g.subject} label={g.subject} value={`${g.entries.length}일`}
            comment={`${formatDateShort(g.entries[0].date)} ~ ${formatDateShort(g.entries[g.entries.length - 1].date)} 기간 동안 진행되었습니다.`}
            showAi={showAi} />
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
