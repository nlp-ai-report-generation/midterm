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
import type { LectureMetadata } from "@/types/evaluation";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "",
    model: "gpt-4o-mini",
    temperature: 0.1,
    chunkMinutes: 30,
    overlapMinutes: 5,
    useCalibrator: true,
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
        showToast("OpenAI API 키가 정상 동작합니다");
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
    <div className="space-y-6 p-6 max-w-[720px] mx-auto">
      <h1 className="text-lg font-bold text-[#191F28]">설정</h1>

      {/* API Connection */}
      <div className="rounded-2xl border border-[#E5E8EB] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#191F28]">API 연결</h2>
          {apiStatus !== "idle" && (
            <span className="flex items-center gap-2 text-xs font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: apiStatus === "valid" ? "#34C759" : "#FF3B30",
                }}
              />
              <span
                style={{
                  color: apiStatus === "valid" ? "#34C759" : "#FF3B30",
                }}
              >
                {apiStatus === "valid" ? "연결됨" : "미연결"}
              </span>
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => update("apiKey", e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-4 py-3 pr-10 bg-[#F7F8FA] rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] placeholder:text-gray-400 focus:outline-none focus:border-[#FF6B00]"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#191F28]"
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
            className="px-5 py-3 bg-[#191F28] text-white font-semibold text-sm rounded-xl hover:opacity-90 shrink-0"
          >
            연결 테스트
          </button>
        </div>
      </div>

      {/* Model Toggle */}
      <div className="rounded-2xl border border-[#E5E8EB] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#191F28] mb-4">모델 선택</h2>
        <div className="flex rounded-xl border border-[#E5E8EB] overflow-hidden w-fit">
          {(["gpt-4o-mini", "gpt-4o"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update("model", m)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
                settings.model === m
                  ? "bg-[#FF6B00] text-white"
                  : "text-gray-500 hover:text-[#191F28]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          예상 비용: 강의당 {COST_PER_LECTURE[settings.model] ?? "~$0.03"}
        </p>
      </div>

      {/* Lecture Selection */}
      <div className="rounded-2xl border border-[#E5E8EB] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#191F28]">강의 선택</h2>
          <button
            onClick={selectAll}
            className="text-xs font-medium text-[#FF6B00] hover:opacity-80"
          >
            {selectedDates.length === lectures.length ? "전체 해제" : "전체 선택"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {selectedDates.length}개 선택 / {lectures.length}개 강의 | 예상 비용 ~$
          {(
            parseFloat(
              (COST_PER_LECTURE[settings.model] ?? "0.03").replace(/[^0-9.]/g, "")
            ) * selectedDates.length
          ).toFixed(2)}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[240px] overflow-y-auto">
          {lectures.map((l) => {
            const isSelected = selectedDates.includes(l.date);
            return (
              <button
                key={l.date}
                onClick={() => toggleDate(l.date)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#FF6B00] bg-[#FFF4EC]"
                    : "border-[#E5E8EB] bg-[#F7F8FA] hover:border-[#FF6B00]/30"
                }`}
              >
                <p
                  className={`text-xs font-bold ${
                    isSelected ? "text-[#FF6B00]" : "text-[#191F28]"
                  }`}
                >
                  {l.date.slice(5)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
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
        className="w-full py-3.5 bg-[#FF6B00] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <p className="text-sm text-gray-500 text-center">
          {evalProgress}
          {evalProgress.startsWith("완료") && (
            <Link
              to="/dashboard"
              className="text-[#FF6B00] font-semibold ml-2 hover:underline"
            >
              대시보드에서 확인
            </Link>
          )}
        </p>
      )}

      {/* Advanced Settings */}
      <div className="rounded-2xl border border-[#E5E8EB] bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F7F8FA] transition-colors"
        >
          <div>
            <h2 className="text-sm font-bold text-[#191F28]">고급 설정</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              기본값으로 충분합니다. 필요한 경우에만 조정하세요.
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
            className={`text-gray-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="px-6 pb-6 space-y-5 border-t border-[#E5E8EB] pt-5">
            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#191F28]">
                  Temperature
                </label>
                <span className="text-xs font-bold text-[#FF6B00] bg-[#FFF4EC] px-2 py-0.5 rounded-md">
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => update("temperature", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#E5E8EB] rounded-full appearance-none cursor-pointer accent-[#FF6B00]"
              />
            </div>

            {/* Chunk / Overlap */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#191F28] mb-2">
                  청크 윈도우 (분)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.chunkMinutes}
                  onChange={(e) =>
                    update("chunkMinutes", parseInt(e.target.value) || 30)
                  }
                  className="w-full px-3 py-2.5 bg-[#F7F8FA] rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191F28] mb-2">
                  오버랩 (분)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.overlapMinutes}
                  onChange={(e) =>
                    update("overlapMinutes", parseInt(e.target.value) || 5)
                  }
                  className="w-full px-3 py-2.5 bg-[#F7F8FA] rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {/* Calibrator Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191F28]">Calibrator</p>
                <p className="text-xs text-gray-400 mt-0.5">점수 보정 및 일관성 검증</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.useCalibrator}
                onClick={() => update("useCalibrator", !settings.useCalibrator)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.useCalibrator ? "bg-[#FF6B00]" : "bg-[#D1D6DB]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.useCalibrator ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-[#191F28] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
            >
              설정 저장
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-[#191F28] text-white rounded-xl shadow-lg text-sm font-medium">
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
