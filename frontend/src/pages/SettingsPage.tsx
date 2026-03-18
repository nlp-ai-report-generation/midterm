import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getSettings,
  saveSettings,
  validateApiKey,
  validateApiKeyRemotely,
} from "@/lib/api";
import type { AppSettings } from "@/lib/api";
import { getAllLectures } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import type { LectureMetadata } from "@/types/evaluation";
import OperatorToolsSection from "@/pages/OperatorToolsSection";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "",
    model: "gpt-4o-mini",
    temperature: 0.0,
    chunkMinutes: 30,
    overlapMinutes: 5,
    useCalibrator: true,
    customPrompt: "",
  });
  const [showKey, setShowKey] = useState(false);
  const [apiStatus, setApiStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);
  const [lectures, setLectures] = useState<LectureMetadata[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const stored = getSettings();
    setSettings(stored);
    if (stored.apiKey) {
      setApiStatus(validateApiKey(stored.apiKey) ? "valid" : "invalid");
    }
    getAllLectures()
      .then(setLectures)
      .catch(() => {});
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleTestConnection = useCallback(async () => {
    if (!settings.apiKey) {
      setApiStatus("invalid");
      return;
    }
    if (!validateApiKey(settings.apiKey)) {
      setApiStatus("invalid");
      showToast("API 키 형식을 확인하세요");
      return;
    }
    try {
      const result = await validateApiKeyRemotely(settings.apiKey);
      setApiStatus(result.valid ? "valid" : "invalid");
      if (result.valid) {
        saveSettings(settings);
        showToast("API 키가 정상 동작해요");
      } else {
        showToast(result.message);
      }
    } catch (error) {
      setApiStatus("invalid");
      showToast(
        error instanceof Error ? error.message : "API 키 검증 중 오류가 발생했습니다"
      );
    }
  }, [settings]);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    showToast("설정이 저장되었습니다");
  }, [settings]);

  const handleRunEvaluation = useCallback(async () => {
    if (selectedDates.length === 0) {
      showToast("평가할 강의를 선택하세요");
      return;
    }
    if (!settings.apiKey || !validateApiKey(settings.apiKey)) {
      showToast("먼저 API 키를 입력하고 연결 테스트를 하세요");
      return;
    }
    setEvaluating(true);
    setEvalProgress(`${selectedDates.length}개 강의 평가 준비 중...`);
    try {
      const res = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: selectedDates,
          model: settings.model,
          temperature: settings.temperature,
          chunk_minutes: settings.chunkMinutes,
          overlap_minutes: settings.overlapMinutes,
          use_calibrator: settings.useCalibrator,
          api_key: settings.apiKey,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "평가 실행 실패");
      }
      const data = await res.json();
      setEvalProgress(`완료! ${data.results?.length ?? 0}개 결과 생성됨`);
      showToast("평가가 완료되었습니다");
    } catch (e) {
      setEvalProgress(
        `오류: ${e instanceof Error ? e.message : "알 수 없는 오류"}`
      );
    } finally {
      setEvaluating(false);
    }
  }, [selectedDates, settings]);

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const selectAll = () => {
    if (selectedDates.length === lectures.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates(lectures.map((l) => l.date));
    }
  };

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "apiKey") setApiStatus("idle");
  };

  const COST_PER_LECTURE: Record<string, string> = {
    "gpt-4o": "~$0.15",
    "gpt-4o-mini": "~$0.03",
  };

  if (!mounted) return null;

  return (
    <div className="page-content" style={{ maxWidth: 720 }}>
      <div>
        <h1 className="text-title">설정</h1>
        <p className="text-caption mt-1">API 연결, 모델 선택, 평가 실행을 한 곳에서 관리해요</p>
      </div>

      {/* API Connection */}
      <div className="card card-padded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section">API 연결</h2>
          {apiStatus !== "idle" && (
            <span className="flex items-center gap-2 text-xs font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: apiStatus === "valid" ? "var(--primary)" : "var(--grey-400)",
                }}
              />
              <span
                style={{
                  color: apiStatus === "valid" ? "var(--primary)" : "var(--text-tertiary)",
                }}
              >
                {apiStatus === "valid" ? "연결됨" : "미연결"}
              </span>
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <label htmlFor="api-key-input" className="sr-only">API 키</label>
            <input
              id="api-key-input"
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => update("apiKey", e.target.value)}
              placeholder="sk-proj-..."
              className="input-field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              aria-label="API 키 표시/숨기기"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {showKey ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
          <button
            onClick={handleTestConnection}
            className="btn-secondary shrink-0"
          >
            연결 테스트
          </button>
        </div>
      </div>

      {/* Model Toggle */}
      <div className="card card-padded">
        <h2 className="text-section mb-4">모델 선택</h2>
        <div className="tab-bar">
          {(["gpt-4o-mini", "gpt-4o"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={settings.model === m}
              onClick={() => update("model", m)}
              className="tab-item"
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-caption mt-2">
          예상 비용: 강의당 {COST_PER_LECTURE[settings.model] ?? "~$0.03"}
        </p>
      </div>

      {/* Lecture Selection */}
      <div className="card card-padded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section">강의 선택</h2>
          <button
            onClick={selectAll}
            className="text-xs font-medium text-primary hover:opacity-80"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {selectedDates.length === lectures.length ? "전체 해제" : "전체 선택"}
          </button>
        </div>
        <p className="text-caption mb-3">
          {selectedDates.length}개 선택 / {lectures.length}개 강의 | 예상 비용 ~$
          {(
            parseFloat(
              (COST_PER_LECTURE[settings.model] ?? "0.03").replace(/[^0-9.]/g, "")
            ) * selectedDates.length
          ).toFixed(2)}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, maxHeight: 260, overflowY: "auto", padding: 2 }}>
          {lectures.map((l) => {
            const isSelected = selectedDates.includes(l.date);
            return (
              <button
                key={l.date}
                onClick={() => toggleDate(l.date)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-inner)",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  background: isSelected ? "var(--primary-light)" : "var(--grey-100)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: isSelected ? "var(--primary)" : "var(--text-primary)" }}
                >
                  {l.date.slice(5)}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.subjects?.[0] ?? "강의"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Run Evaluation */}
      <button
        onClick={handleRunEvaluation}
        disabled={evaluating || selectedDates.length === 0 || apiStatus !== "valid"}
        className="btn-primary w-full"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        {evaluating ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            평가 진행 중...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
            {selectedDates.length > 0
              ? `${selectedDates.length}개 강의 평가 실행`
              : "강의를 선택하세요"}
          </>
        )}
      </button>

      {evalProgress && (
        <p className="text-body text-center">
          {evalProgress}
          {evalProgress.startsWith("완료") && (
            <Link
              to="/dashboard"
              className="text-primary font-semibold ml-2 hover:underline"
            >
              대시보드에서 확인
            </Link>
          )}
        </p>
      )}

      {/* Advanced Settings */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          className="w-full flex items-center justify-between text-left hover:bg-background transition-colors"
          style={{ padding: "24px 28px", background: "none", border: "none", cursor: "pointer" }}
        >
          <div>
            <h2 className="text-section">고급 설정</h2>
            <p className="text-caption mt-0.5">
              기본값으로 충분해요. 필요한 경우에만 조정해주세요.
            </p>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-text-muted transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showAdvanced && (
          <div style={{ padding: "24px 28px", paddingTop: 0 }}>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="temperature-range" className="text-sm font-semibold text-foreground">
                    Temperature
                  </label>
                  <span className="text-xs font-bold text-primary" style={{ background: "var(--primary-light)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                    {settings.temperature.toFixed(1)}
                  </span>
                </div>
                <input
                  id="temperature-range"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => update("temperature", parseFloat(e.target.value))}
                  className="progress-bar"
                />
                <p className="text-caption" style={{ marginTop: 6 }}>
                  낮을수록 일관된 결과, 높을수록 다양한 관점
                </p>
              </div>

              {/* Chunk / Overlap */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="chunk-minutes" className="block text-sm font-semibold text-foreground mb-2">
                    청크 윈도우 (분)
                  </label>
                  <input
                    id="chunk-minutes"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.chunkMinutes}
                    onChange={(e) =>
                      update("chunkMinutes", parseInt(e.target.value) || 30)
                    }
                    className="input-field"
                  />
                  <p className="text-caption" style={{ marginTop: 6 }}>
                    한 번에 분석하는 시간 단위 (기본 30분)
                  </p>
                </div>
                <div>
                  <label htmlFor="overlap-minutes" className="block text-sm font-semibold text-foreground mb-2">
                    오버랩 (분)
                  </label>
                  <input
                    id="overlap-minutes"
                    type="number"
                    min="0"
                    max="30"
                    value={settings.overlapMinutes}
                    onChange={(e) =>
                      update("overlapMinutes", parseInt(e.target.value) || 5)
                    }
                    className="input-field"
                  />
                  <p className="text-caption" style={{ marginTop: 6 }}>
                    청크 간 겹치는 시간 (맥락 유지용)
                  </p>
                </div>
              </div>

              {/* Calibrator Toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Calibrator</p>
                    <p className="text-caption mt-0.5">점수 보정 및 일관성 검증</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.useCalibrator}
                    onClick={() => update("useCalibrator", !settings.useCalibrator)}
                    className="toggle"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
                <p className="text-caption" style={{ marginTop: 6 }}>
                  카테고리 간 점수 일관성을 자동으로 보정해요
                </p>
              </div>

              {/* Custom Prompt */}
              <div>
                <label htmlFor="custom-prompt" className="block text-sm font-semibold text-foreground mb-2">
                  추가 지시사항 (선택)
                </label>
                <textarea
                  id="custom-prompt"
                  value={settings.customPrompt}
                  onChange={(e) => update("customPrompt", e.target.value)}
                  placeholder="평가 시 추가로 고려할 사항을 입력하세요..."
                  className="input-field"
                  style={{ minHeight: 80, resize: "vertical" }}
                />
              </div>

              <button
                onClick={handleSave}
                className="btn-secondary w-full"
                style={{ paddingTop: 12, paddingBottom: 12 }}
              >
                설정 저장
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Operator Tools */}
      <OperatorToolsSection />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: "var(--text-primary)", color: "var(--surface)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
