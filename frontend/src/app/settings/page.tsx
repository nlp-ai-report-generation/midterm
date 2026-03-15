"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings, saveSettings, validateApiKey } from "@/lib/api";
import type { AppSettings } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "",
    model: "gpt-4o",
    temperature: 0.0,
    chunkMinutes: 30,
    overlapMinutes: 5,
    useCalibrator: true,
  });
  const [showKey, setShowKey] = useState(false);
  const [apiStatus, setApiStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [toast, setToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getSettings();
    setSettings(stored);
    if (stored.apiKey) {
      setApiStatus(validateApiKey(stored.apiKey) ? "valid" : "invalid");
    }
    setMounted(true);
  }, []);

  const handleTestConnection = useCallback(() => {
    if (validateApiKey(settings.apiKey)) {
      setApiStatus("valid");
    } else {
      setApiStatus("invalid");
    }
  }, [settings.apiKey]);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }, [settings]);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "apiKey") setApiStatus("idle");
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Page Header */}
      <motion.div {...fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
        <p className="text-text-secondary mt-1">
          평가 파이프라인 실행에 필요한 API 키 및 파라미터를 설정하세요
        </p>
      </motion.div>

      {/* API Key Section */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light space-y-5"
      >
        <h2 className="text-lg font-bold text-foreground">API 설정</h2>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => update("apiKey", e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 pr-12 bg-background rounded-xl border border-border-light text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground transition-colors"
            >
              {showKey ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Connection Test */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleTestConnection}
            className="px-5 py-2.5 bg-foreground text-surface font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            연결 테스트
          </button>
          {/* Status Indicator */}
          <AnimatePresence>
            {apiStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    apiStatus === "valid" ? "bg-success" : "bg-error"
                  }`}
                />
                <span className={`text-sm font-medium ${
                  apiStatus === "valid" ? "text-success" : "text-error"
                }`}>
                  {apiStatus === "valid" ? "연결 성공" : "유효하지 않은 키"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Model Settings */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light space-y-6"
      >
        <h2 className="text-lg font-bold text-foreground">모델 설정</h2>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            모델 선택
          </label>
          <div className="flex gap-3">
            {(["gpt-4o", "gpt-4o-mini"] as const).map((model) => (
              <label
                key={model}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.model === model
                    ? "border-primary bg-primary-light text-primary font-semibold"
                    : "border-border-light bg-background text-text-secondary hover:border-primary/20"
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={model}
                  checked={settings.model === model}
                  onChange={() => update("model", model)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    settings.model === model ? "border-primary" : "border-border"
                  }`}
                >
                  {settings.model === model && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm">{model}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Temperature Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-foreground">
              Temperature
            </label>
            <span className="text-sm font-bold text-primary bg-primary-light px-2.5 py-1 rounded-lg">
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
            className="w-full h-2 bg-border-light rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-text-tertiary">0.0 (결정적)</span>
            <span className="text-xs text-text-tertiary">1.0 (창의적)</span>
          </div>
        </div>
      </motion.div>

      {/* Pipeline Settings */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light space-y-6"
      >
        <h2 className="text-lg font-bold text-foreground">파이프라인 설정</h2>

        {/* Chunk Window */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              청크 윈도우 (분)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.chunkMinutes}
              onChange={(e) => update("chunkMinutes", parseInt(e.target.value) || 30)}
              className="w-full px-4 py-3 bg-background rounded-xl border border-border-light text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Overlap */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              오버랩 (분)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={settings.overlapMinutes}
              onChange={(e) => update("overlapMinutes", parseInt(e.target.value) || 5)}
              className="w-full px-4 py-3 bg-background rounded-xl border border-border-light text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Calibrator Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-foreground">
              Calibrator 사용
            </label>
            <p className="text-xs text-text-tertiary mt-0.5">
              점수 보정 및 일관성 검증 단계를 활성화합니다
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.useCalibrator}
            onClick={() => update("useCalibrator", !settings.useCalibrator)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.useCalibrator ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.useCalibrator ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
      >
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-primary text-white font-semibold text-base rounded-xl hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
        >
          설정 저장
        </button>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 bg-foreground text-surface rounded-xl shadow-[var(--shadow-lg)] text-sm font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            설정이 저장되었습니다
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
