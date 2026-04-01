import { useState, useCallback } from "react";
import { X, Download, FileText } from "lucide-react";
import { exportReportToNotion, uploadToDrive } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  lectureDate: string;
  subject: string;
  instructor: string;
  score: number;
  model: string;
  categories?: Array<{ name: string; score: number }>;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  simulationSummary?: string;
}

export default function ReportModal({
  open,
  onClose,
  lectureDate,
  subject,
  instructor,
  score,
  model,
  categories = [],
  strengths = [],
  improvements = [],
  recommendations = [],
  simulationSummary,
}: ReportModalProps) {
  const [exporting, setExporting] = useState<"notion" | "drive" | null>(null);
  const [message, setMessage] = useState("");

  const reportMarkdown = buildMarkdown({
    lectureDate, subject, instructor, score, model,
    categories, strengths, improvements, recommendations, simulationSummary,
  });

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

  if (!open) return null;

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className="report-titlebar">
          <div className="report-titlebar-dots">
            <button className="report-dot report-dot-close" onClick={onClose} />
            <span className="report-dot report-dot-min" />
            <span className="report-dot report-dot-max" />
          </div>
          <span className="report-titlebar-text">리포트 미리보기</span>
          <div style={{ width: 52 }} />
        </div>

        {/* Body */}
        <div className="report-body">
          {/* Header */}
          <div className="report-header">
            <img src="/emoji/exploding-head.png" alt="" width={40} height={40} />
            <div>
              <p className="report-title">{subject} 강의 분석 리포트</p>
              <p className="report-meta">{lectureDate} · {instructor}</p>
            </div>
          </div>

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
              <div className="report-section-header">
                <img src="/emoji/sparkles.png" alt="" width={20} height={20} />
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
          {simulationSummary && (
            <div className="report-section">
              <div className="report-section-header">
                <img src="/emoji/dna.png" alt="" width={20} height={20} />
                <p className="report-section-title">뇌 반응 시뮬레이션 요약</p>
              </div>
              <p className="report-sim-text">{simulationSummary}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="report-footer">
          {message && <span className="report-message">{message}</span>}
          <div className="report-actions">
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
    </div>
  );
}

function buildMarkdown(data: {
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
