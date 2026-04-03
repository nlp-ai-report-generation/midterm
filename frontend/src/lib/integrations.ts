import { supabase } from "@/lib/supabase";

interface DriveIntegration {
  token: string;
}

interface NotionIntegration {
  token: string;
  database_id?: string;
  workspace?: string;
  database?: { id: string; title: string; url: string };
}

const DRIVE_KEY = "drive-integration";
const NOTION_KEY = "notion-integration";

export function getStoredDriveIntegration(): DriveIntegration | null {
  try {
    const raw = localStorage.getItem(DRIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DriveIntegration;
    return parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredDriveIntegration(payload: DriveIntegration): void {
  localStorage.setItem(DRIVE_KEY, JSON.stringify(payload));
}

export function clearStoredDriveIntegration(): void {
  localStorage.removeItem(DRIVE_KEY);
}

export function getStoredNotionIntegration(): NotionIntegration | null {
  try {
    const raw = localStorage.getItem(NOTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NotionIntegration;
    return parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredNotionIntegration(payload: NotionIntegration): void {
  localStorage.setItem(NOTION_KEY, JSON.stringify(payload));
}

export function clearStoredNotionIntegration(): void {
  localStorage.removeItem(NOTION_KEY);
}

export async function getDriveToken(): Promise<string | null> {
  const stored = getStoredDriveIntegration();
  if (stored?.token) return stored.token;

  const { data } = await supabase.auth.getSession();
  const session = data.session as any;
  const provider = session?.user?.app_metadata?.provider as string | undefined;
  if (provider !== "google") return null;
  const token = session?.provider_token as string | undefined;
  return token ?? null;
}
