import type { VerbitraText, Session } from "./types";

const KEYS = {
  texts: "memorizer:texts",
  sessions: "memorizer:sessions",
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function loadTexts(): VerbitraText[] {
  return readJSON<VerbitraText[]>(KEYS.texts, []);
}

export function saveTexts(texts: VerbitraText[]): void {
  writeJSON(KEYS.texts, texts);
}

export function loadSessions(): Session[] {
  return readJSON<Session[]>(KEYS.sessions, []);
}

export function saveSessions(sessions: Session[]): void {
  writeJSON(KEYS.sessions, sessions);
}

export function clearAll(): void {
  localStorage.removeItem(KEYS.texts);
  localStorage.removeItem(KEYS.sessions);
}
