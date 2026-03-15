import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { formatDateShort } from "@/lib/utils";
import {
  getTranscriptStats,
  getSpeakerDistribution,
  getFillerWords,
  getInteractionMetrics,
  getCurriculumFlow,
} from "@/lib/data";
import type {
  TranscriptStats,
  SpeakerDistribution,
  FillerWordStats,
  InteractionMetrics,
  CurriculumEntry,
} from "@/types/evaluation";

type TabKey = "stats" | "speakers" | "interaction" | "filler" | "curriculum";

const TABS: { key: TabKey; label: string }[] = [
  { key: "stats", label: "통계" },
  { key: "speakers", label: "화자" },
  { key: "interaction", label: "상호작용" },
  { key: "filler", label: "습관어" },
  { key: "curriculum", label: "커리큘럼" },
];

const SUBJECT_COLORS: Record<string, string> = {
  "객체지향 프로그래밍": "#8B5CF6",
  프론트엔드: "#3182F6",
  백엔드: "#FF6B00",
};

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #E5E8EB",
  borderRadius: "12px",
  fontSize: 13,
};

export default function EDAPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("stats");
  const [stats, setStats] = useState<TranscriptStats[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerDistribution[]>([]);
  const [fillerWords, setFillerWords] = useState<FillerWordStats[]>([]);
  const [interactions, setInteractions] = useState<InteractionMetrics[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTranscriptStats(),
      getSpeakerDistribution(),
      getFillerWords(),
      getInteractionMetrics(),
      getCurriculumFlow(),
    ])
      .then(([s, sp, f, i, c]) => {
        setStats(s);
        setSpeakers(sp);
        setFillerWords(f);
        setInteractions(i);
        setCurriculum(c);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto">
      <h1 className="text-xl font-bold text-[#191F28]">탐색적 데이터 분석</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl bg-white p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.06)]" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-[#FF6B00] text-white"
                : "text-gray-500 hover:text-[#191F28]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div role="tabpanel">
        {activeTab === "stats" && <StatsTab data={stats} />}
        {activeTab === "speakers" && <SpeakersTab data={speakers} />}
        {activeTab === "interaction" && <InteractionTab data={interactions} />}
        {activeTab === "filler" && <FillerTab data={fillerWords} />}
        {activeTab === "curriculum" && <CurriculumTab data={curriculum} />}
      </div>
    </div>
  );
}

/* --- Summary Card --- */
function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="text-[13px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#191F28]">{value}</p>
    </div>
  );
}

/* --- Stats Tab --- */
function StatsTab({ data }: { data: TranscriptStats[] }) {
  const totalLines = data.reduce((s, d) => s + d.line_count, 0);
  const avgLines = data.length > 0 ? Math.round(totalLines / data.length) : 0;
  const maxLines = data.length > 0 ? Math.max(...data.map((d) => d.line_count)) : 0;
  const minLines = data.length > 0 ? Math.min(...data.map((d) => d.line_count)) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard label="총 라인 수" value={`${totalLines.toLocaleString()}줄`} />
        <SummaryCard label="평균 라인 수" value={`${avgLines.toLocaleString()}줄`} />
        <SummaryCard label="최대" value={`${maxLines.toLocaleString()}줄`} />
        <SummaryCard label="최소" value={`${minLines.toLocaleString()}줄`} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[15px] font-bold text-[#191F28] mb-1">강의별 라인 수</h3>
        <p className="text-xs text-gray-500 mb-5">STT 트랜스크립트 라인 수 비교</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              axisLine={{ stroke: "#E5E8EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelFormatter={(l) => formatDateShort(l as string)}
            />
            <Bar dataKey="line_count" name="라인 수" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={entry.line_count < 1200 ? "#FF9500" : "#FF6B00"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[15px] font-bold text-[#191F28] mb-1">발화속도 추이</h3>
        <p className="text-xs text-gray-500 mb-5">시간당 발화 라인 수</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelFormatter={(l) => formatDateShort(l as string)}
            />
            <Line
              type="monotone"
              dataKey="utterance_rate"
              name="줄/시간"
              stroke="#3182F6"
              strokeWidth={2}
              dot={{ r: 3, fill: "#fff", stroke: "#3182F6", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#3182F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --- Speakers Tab --- */
function SpeakersTab({ data }: { data: SpeakerDistribution[] }) {
  const totalLines = data.reduce(
    (sum, d) => sum + Object.values(d.speakers).reduce((s, v) => s + v, 0),
    0
  );
  const mainSpeakerLines = data.reduce(
    (sum, d) => sum + (d.speakers["주강사"] ?? 0),
    0
  );
  const mainRatio = totalLines > 0 ? ((mainSpeakerLines / totalLines) * 100).toFixed(1) : "0";
  const multiCount = data.filter((d) => Object.keys(d.speakers).length > 1).length;

  const chartData = data.map((d) => ({
    date: d.date,
    주강사: d.speakers["주강사"] ?? 0,
    보조강사: (d.speakers["보조강사1"] ?? 0) + (d.speakers["보조강사2"] ?? 0),
    기타: d.speakers["기타"] ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="주강사 발화 비율" value={`${mainRatio}%`} />
        <SummaryCard label="다중 화자 강의" value={`${multiCount}개`} />
        <SummaryCard
          label="단독 강의"
          value={`${data.filter((d) => Object.keys(d.speakers).length === 1).length}개`}
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[15px] font-bold text-[#191F28] mb-1">화자별 발화 분포</h3>
        <p className="text-xs text-gray-500 mb-5">강의별 주강사 / 보조강사 / 기타</p>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelFormatter={(l) => formatDateShort(l as string)}
            />
            <Legend />
            <Bar dataKey="주강사" stackId="a" fill="#FF6B00" />
            <Bar dataKey="보조강사" stackId="a" fill="#FF9F5A" />
            <Bar dataKey="기타" stackId="a" fill="#D1D6DB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --- Interaction Tab --- */
function InteractionTab({ data }: { data: InteractionMetrics[] }) {
  const totalQuestions = data.reduce((s, d) => s + d.question_count, 0);
  const totalChecks = data.reduce((s, d) => s + d.understanding_check_count, 0);
  const avgQuestions = data.length > 0 ? (totalQuestions / data.length).toFixed(1) : "0";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="총 질문 수" value={`${totalQuestions}회`} />
        <SummaryCard label="이해도 확인" value={`${totalChecks}회`} />
        <SummaryCard label="평균 질문 빈도" value={`${avgQuestions}회/강의`} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[15px] font-bold text-[#191F28] mb-1">상호작용 지표 추이</h3>
        <p className="text-xs text-gray-500 mb-5">질문, 이해도 확인, 참여 유도</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelFormatter={(l) => formatDateShort(l as string)}
            />
            <Legend />
            <Bar
              dataKey="question_count"
              name="질문"
              fill="#FF6B00"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="understanding_check_count"
              name="이해도 확인"
              fill="#3182F6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="participation_prompts"
              name="참여 유도"
              fill="#34C759"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --- Filler Tab --- */
function FillerTab({ data }: { data: FillerWordStats[] }) {
  const totalByWord = data.reduce(
    (acc, d) => {
      Object.entries(d.words).forEach(([word, count]) => {
        acc[word] = (acc[word] ?? 0) + count;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(totalByWord).map(([name, value]) => ({ name, value }));
  const COLORS = ["#FF6B00", "#3182F6", "#FF9500", "#34C759", "#8B5CF6"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-bold text-[#191F28] mb-1">습관어 비율</h3>
          <p className="text-xs text-gray-500 mb-5">전체 강의 합산</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={65}
                paddingAngle={3}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Word Count Cards */}
        <div className="space-y-3">
          {Object.entries(totalByWord)
            .sort((a, b) => b[1] - a[1])
            .map(([word, count], i) => (
              <div
                key={word}
                className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-base font-bold text-[#191F28]">
                      &ldquo;{word}&rdquo;
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#191F28]">
                    {count.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-6">
                  평균 {(count / data.length).toFixed(1)}회/강의
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Per-lecture bar chart */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[15px] font-bold text-[#191F28] mb-1">강의별 습관어 총량</h3>
        <p className="text-xs text-gray-500 mb-5">날짜별 습관어 사용 빈도</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8B95A1" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelFormatter={(l) => formatDateShort(l as string)}
            />
            <Bar dataKey="total" name="합계" fill="#FF6B00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --- Curriculum Tab --- */
function CurriculumTab({ data }: { data: CurriculumEntry[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="text-[15px] font-bold text-[#191F28] mb-1">커리큘럼 타임라인</h3>
      <p className="text-xs text-gray-500 mb-6">날짜별 과목 및 학습 내용 흐름</p>

      <div className="space-y-0">
        {data.map((entry, i) => {
          const color = SUBJECT_COLORS[entry.subject] ?? "#8B95A1";
          const isNewSubject = i === 0 || data[i - 1].subject !== entry.subject;

          return (
            <div key={entry.date} className="flex items-start gap-5 group">
              {/* Timeline */}
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div
                  className="w-3.5 h-3.5 rounded-full border-[3px] mt-0.5"
                  style={{
                    borderColor: color,
                    backgroundColor: isNewSubject ? color : "#fff",
                  }}
                />
                {i < data.length - 1 && (
                  <div
                    className="w-0.5 h-12 mt-1"
                    style={{ backgroundColor: `${color}30` }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400">
                    {formatDateShort(entry.date)}
                  </span>
                  {isNewSubject && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: color }}
                    >
                      {entry.subject}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#191F28] leading-relaxed">
                  {entry.contents.join(", ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
