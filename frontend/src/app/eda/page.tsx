"use client";

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
  { key: "stats", label: "스크립트 통계" },
  { key: "speakers", label: "화자 분석" },
  { key: "interaction", label: "상호작용" },
  { key: "filler", label: "습관어" },
  { key: "curriculum", label: "커리큘럼" },
];

const SUBJECT_COLORS: Record<string, string> = {
  "객체지향 프로그래밍": "#8B5CF6",
  "프론트엔드": "#3182F6",
  "백엔드": "#FF6B00",
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 탭 */}
      <div className="flex gap-2 bg-surface rounded-2xl p-1.5 shadow-[var(--shadow-sm)] border border-border-light w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-foreground hover:bg-border-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "stats" && <StatsTab data={stats} />}
      {activeTab === "speakers" && <SpeakersTab data={speakers} />}
      {activeTab === "interaction" && <InteractionTab data={interactions} />}
      {activeTab === "filler" && <FillerTab data={fillerWords} />}
      {activeTab === "curriculum" && <CurriculumTab data={curriculum} />}
    </div>
  );
}

function StatsTab({ data }: { data: TranscriptStats[] }) {
  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "총 라인 수", value: data.reduce((s, d) => s + d.line_count, 0).toLocaleString() + "줄" },
          { label: "평균 라인 수", value: Math.round(data.reduce((s, d) => s + d.line_count, 0) / data.length).toLocaleString() + "줄" },
          { label: "최대", value: `${Math.max(...data.map((d) => d.line_count)).toLocaleString()}줄` },
          { label: "최소", value: `${Math.min(...data.map((d) => d.line_count)).toLocaleString()}줄` },
        ].map((item) => (
          <div key={item.label} className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
            <p className="text-sm text-text-secondary">{item.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 라인 수 바 차트 */}
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
        <h3 className="text-base font-bold text-foreground mb-1">강의별 라인 수</h3>
        <p className="text-sm text-text-secondary mb-6">STT 트랜스크립트 라인 수 비교</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={45} />
            <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow-md)" }} labelFormatter={(l) => formatDateShort(l as string)} />
            <Bar dataKey="line_count" name="라인 수" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.date} fill={entry.line_count < 1200 ? "var(--warning)" : "var(--primary)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 발화속도 라인 차트 */}
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
        <h3 className="text-base font-bold text-foreground mb-1">발화속도 추이</h3>
        <p className="text-sm text-text-secondary mb-6">시간당 발화 라인 수</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} labelFormatter={(l) => formatDateShort(l as string)} />
            <Line type="monotone" dataKey="utterance_rate" name="줄/시간" stroke="var(--info)" strokeWidth={2} dot={{ r: 3, fill: "var(--surface)", stroke: "var(--info)", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SpeakersTab({ data }: { data: SpeakerDistribution[] }) {
  const totalLines = data.reduce((sum, d) => sum + Object.values(d.speakers).reduce((s, v) => s + v, 0), 0);
  const mainSpeakerLines = data.reduce((sum, d) => sum + (d.speakers["주강사"] ?? 0), 0);
  const mainRatio = ((mainSpeakerLines / totalLines) * 100).toFixed(1);

  const chartData = data.map((d) => ({
    date: d.date,
    주강사: d.speakers["주강사"] ?? 0,
    보조강사: (d.speakers["보조강사1"] ?? 0) + (d.speakers["보조강사2"] ?? 0),
    기타: d.speakers["기타"] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
          <p className="text-sm text-text-secondary">주강사 발화 비율</p>
          <p className="text-xl font-bold text-foreground mt-1">{mainRatio}%</p>
        </div>
        <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
          <p className="text-sm text-text-secondary">다중 화자 강의</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.filter((d) => Object.keys(d.speakers).length > 1).length}개</p>
        </div>
        <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
          <p className="text-sm text-text-secondary">단독 강의</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.filter((d) => Object.keys(d.speakers).length === 1).length}개</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
        <h3 className="text-base font-bold text-foreground mb-1">화자별 발화 분포</h3>
        <p className="text-sm text-text-secondary mb-6">강의별 주강사 / 보조강사 / 기타 발화량</p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={45} />
            <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} labelFormatter={(l) => formatDateShort(l as string)} />
            <Legend />
            <Bar dataKey="주강사" stackId="a" fill="var(--primary)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="보조강사" stackId="a" fill="var(--primary-hover)" />
            <Bar dataKey="기타" stackId="a" fill="var(--border)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InteractionTab({ data }: { data: InteractionMetrics[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
          <p className="text-sm text-text-secondary">총 질문 수 (물음표)</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.reduce((s, d) => s + d.question_count, 0)}회</p>
        </div>
        <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
          <p className="text-sm text-text-secondary">이해도 확인 ("되셨어요")</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.reduce((s, d) => s + d.understanding_check_count, 0)}회</p>
        </div>
        <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
          <p className="text-sm text-text-secondary">평균 질문 빈도</p>
          <p className="text-xl font-bold text-foreground mt-1">{(data.reduce((s, d) => s + d.question_count, 0) / data.length).toFixed(1)}회/강의</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
        <h3 className="text-base font-bold text-foreground mb-1">상호작용 지표 추이</h3>
        <p className="text-sm text-text-secondary mb-6">질문, 이해도 확인, 참여 유도 빈도</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} labelFormatter={(l) => formatDateShort(l as string)} />
            <Legend />
            <Bar dataKey="question_count" name="질문(물음표)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="understanding_check_count" name="이해도 확인" fill="var(--info)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="participation_prompts" name="참여 유도" fill="var(--success)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
  const COLORS = ["var(--primary)", "var(--info)", "var(--warning)", "var(--success)"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 파이 차트 */}
        <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
          <h3 className="text-base font-bold text-foreground mb-1">습관어 비율</h3>
          <p className="text-sm text-text-secondary mb-6">전체 강의 합산</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={3}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 총계 카드 */}
        <div className="space-y-3">
          {Object.entries(totalByWord)
            .sort((a, b) => b[1] - a[1])
            .map(([word, count], i) => (
              <div key={word} className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-lg font-bold text-foreground">"{word}"</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">{count.toLocaleString()}</span>
                </div>
                <p className="text-sm text-text-tertiary mt-1 ml-6">
                  평균 {(count / data.length).toFixed(1)}회/강의
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* 강의별 습관어 바 차트 */}
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
        <h3 className="text-base font-bold text-foreground mb-1">강의별 습관어 총량</h3>
        <p className="text-sm text-text-secondary mb-6">날짜별 습관어 사용 빈도</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }} labelFormatter={(l) => formatDateShort(l as string)} />
            <Bar dataKey="total" name="합계" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CurriculumTab({ data }: { data: CurriculumEntry[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
        <h3 className="text-base font-bold text-foreground mb-1">커리큘럼 타임라인</h3>
        <p className="text-sm text-text-secondary mb-6">날짜별 과목 및 학습 내용 흐름</p>

        <div className="space-y-3">
          {data.map((entry, i) => {
            const color = SUBJECT_COLORS[entry.subject] ?? "var(--text-tertiary)";
            const isNewSubject = i === 0 || data[i - 1].subject !== entry.subject;

            return (
              <div key={entry.date} className="flex items-start gap-4">
                {/* 타임라인 도트 */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{ backgroundColor: color }}
                  />
                  {i < data.length - 1 && (
                    <div className="w-0.5 h-12 bg-border-light mt-1" />
                  )}
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text-tertiary">
                      {formatDateShort(entry.date)}
                    </span>
                    {isNewSubject && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: color }}
                      >
                        {entry.subject}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {entry.contents.join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
