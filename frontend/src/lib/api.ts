// lib/api.ts — Settings persistence layer

export interface AppSettings {
  apiKey: string;
  model: "gpt-4o" | "gpt-4o-mini";
  temperature: number;
  chunkMinutes: number;
  overlapMinutes: number;
  useCalibrator: boolean;
}

const SETTINGS_KEY = "lecture-analysis-settings";

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  model: "gpt-4o",
  temperature: 0.0,
  chunkMinutes: 30,
  overlapMinutes: 5,
  useCalibrator: true,
};

/** Load settings from localStorage, falling back to defaults */
export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Persist settings to localStorage */
export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Check whether an API key has been stored */
export function isApiKeyConfigured(): boolean {
  const settings = getSettings();
  return validateApiKey(settings.apiKey);
}

/** Basic client-side validation: must start with "sk-" and be at least 20 chars */
export function validateApiKey(key: string): boolean {
  return key.startsWith("sk-") && key.length >= 20;
}
