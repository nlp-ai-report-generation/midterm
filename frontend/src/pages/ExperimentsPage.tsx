import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDateShort, scoreColor, scoreBadgeTextColor } from "@/lib/utils";

interface ExperimentResult {
  experiment_id: string;
  model: string;
  date: string;
  avg_score: number;
  lectures: { date: string; score: number }[];
  reliability?: {
    kappa?: number;
    alpha?: number;
    icc?: number;
  };
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/experiments")
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: ExperimentResult[]) => setExperiments(data))
      .catch(() => setExperiments([]))
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
      <div>
        <h1 className="text-title">실험 기록</h1>
        <p className="text-caption mt-1">
          같은 강의를 다른 설정으로 평가한 결과를 비교합니다
        </p>
      </div>

      {experiments.length === 0 ? (
        <div className="card card-padded" style={{ textAlign: "center", padding: "48px 32px" }}>
          <p className="text-body" style={{ marginBottom: 8 }}>
            아직 실험 기록이 없습니다.
          </p>
          <p className="text-caption" style={{ marginBottom: 24 }}>
            설정에서 평가를 실행하면 결과가 여기에 기록됩니다
          </p>
          <Link to="/settings" className="btn-primary" style={{ display: "inline-flex" }}>
            설정으로 이동
          </Link>
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: "1fr" }}>
          {experiments.map((exp) => (
            <div key={exp.experiment_id} className="card card-padded">
              <button
                onClick={() =>
                  setExpandedId(expandedId === exp.experiment_id ? null : exp.experiment_id)
                }
                className="w-full text-left"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-section">{exp.experiment_id}</p>
                    <p className="text-caption mt-1">
                      {exp.model} · {formatDateShort(exp.date)} · {exp.lectures.length}개 강의 평가
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="score-badge score-badge-sm"
                      style={{
                        backgroundColor: scoreColor(exp.avg_score),
                        color: scoreBadgeTextColor(exp.avg_score),
                      }}
                    >
                      {exp.avg_score.toFixed(1)}
                    </span>
                    <svg
                      className={`w-5 h-5 text-text-muted transition-transform duration-200 ${expandedId === exp.experiment_id ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedId === exp.experiment_id && (
                <div style={{ marginTop: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="text-label" style={{ textAlign: "left", padding: "8px 12px" }}>
                          강의 날짜
                        </th>
                        <th className="text-label" style={{ textAlign: "right", padding: "8px 12px" }}>
                          점수
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exp.lectures.map((lec) => (
                        <tr key={lec.date}>
                          <td className="text-body" style={{ padding: "6px 12px" }}>
                            {formatDateShort(lec.date)}
                          </td>
                          <td style={{ textAlign: "right", padding: "6px 12px" }}>
                            <span
                              className="score-badge score-badge-sm"
                              style={{
                                backgroundColor: scoreColor(lec.score),
                                color: scoreBadgeTextColor(lec.score),
                              }}
                            >
                              {lec.score.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {exp.reliability && (
                    <div className="inner-card" style={{ marginTop: 12 }}>
                      <p className="text-label" style={{ marginBottom: 8 }}>신뢰도 지표</p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {exp.reliability.kappa != null && (
                          <span className="text-caption">
                            Cohen&apos;s kappa: <strong className="text-body">{exp.reliability.kappa.toFixed(3)}</strong>
                          </span>
                        )}
                        {exp.reliability.alpha != null && (
                          <span className="text-caption">
                            Krippendorff&apos;s alpha: <strong className="text-body">{exp.reliability.alpha.toFixed(3)}</strong>
                          </span>
                        )}
                        {exp.reliability.icc != null && (
                          <span className="text-caption">
                            ICC: <strong className="text-body">{exp.reliability.icc.toFixed(3)}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 신뢰도 지표 안내 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>신뢰도 지표 안내</h2>
        <p className="text-caption" style={{ marginBottom: 20 }}>
          평가 결과를 얼마나 믿을 수 있는지 판단하는 기준입니다
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="inner-card">
            <p className="text-label" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "serif", fontSize: 14 }}>&kappa;</span> (카파) &mdash; 일치도
            </p>
            <p className="text-body">
              두 번 평가했을 때 결과가 얼마나 같은지를 나타냅니다.
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              0.61 이상이면 양호한 수준입니다
            </p>
          </div>
          <div className="inner-card">
            <p className="text-label" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "serif", fontSize: 14 }}>&alpha;</span> (알파) &mdash; 동의도
            </p>
            <p className="text-body">
              여러 평가자가 동의하는 정도를 측정합니다.
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              0.667 이상이면 신뢰할 수 있는 수준입니다
            </p>
          </div>
          <div className="inner-card">
            <p className="text-label" style={{ marginBottom: 6 }}>
              ICC &mdash; 재현성
            </p>
            <p className="text-body">
              점수의 재현 가능성을 나타냅니다. 같은 조건에서 다시 평가해도 비슷한 결과가 나오는지 확인합니다.
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              0.75 이상이면 안정적인 수준입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
