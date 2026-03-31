// lib/api.ts — Settings persistence layer

export interface AppSettings {
  apiKey: string;
  model: "gpt-4o" | "gpt-4o-mini";
  temperature: number;
  chunkMinutes: number;
  overlapMinutes: number;
  useCalibrator: boolean;
  customPrompt: string;
}

const SETTINGS_KEY = "lecture-analysis-settings";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  model: "gpt-4o",
  temperature: 0.0,
  chunkMinutes: 30,
  overlapMinutes: 5,
  useCalibrator: true,
  customPrompt: "",
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

export async function validateApiKeyRemotely(key: string): Promise<{
  valid: boolean;
  message: string;
}> {
  if (!validateApiKey(key)) {
    return {
      valid: false,
      message: "API 키 형식이 올바르지 않습니다",
    };
  }

  const res = await fetch(`${API_BASE_URL}/api/validate-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      model: "gpt-4o-mini",
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    throw new Error(`API 키 검증 요청 실패: ${res.status}`);
  }

  return res.json() as Promise<{ valid: boolean; message: string }>;
}

/** Export evaluation to Notion */
export async function exportToNotion(params: {
  token: string;
  database_id: string;
  lecture_date: string;
  score: number;
  model?: string;
  subject?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
}): Promise<{ success: boolean; url: string; id: string; error: string }> {
  const res = await fetch(`${API_BASE_URL}/api/notion/create-page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

/** Get Notion OAuth URL */
export async function getNotionAuthUrl(): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/notion`);
  return res.json();
}

/** Exchange Notion auth code for token */
export async function notionCallback(
  code: string
): Promise<{ access_token: string; workspace_name: string }> {
  const res = await fetch(
    `${API_BASE_URL}/api/auth/notion/callback?code=${encodeURIComponent(code)}`
  );
  return res.json();
}

/** List Notion databases */
export async function listNotionDatabases(
  token: string
): Promise<{ databases: { id: string; title: string; url: string }[] }> {
  const res = await fetch(
    `${API_BASE_URL}/api/notion/databases?token=${encodeURIComponent(token)}`
  );
  return res.json();
}

/** List Google Drive text files */
export async function listDriveFiles(
  token: string
): Promise<{ files: { id: string; name: string; modifiedTime: string }[] }> {
  const res = await fetch(
    `${API_BASE_URL}/api/drive/files?token=${encodeURIComponent(token)}`
  );
  return res.json();
}

/** Download a file from Google Drive */
export async function downloadDriveFile(
  fileId: string,
  token: string
): Promise<{ content: string; filename: string }> {
  const res = await fetch(
    `${API_BASE_URL}/api/drive/download/${fileId}?token=${encodeURIComponent(token)}`
  );
  return res.json();
}
