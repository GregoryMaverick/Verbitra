import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { cancelTextNotifications, cancelAllNotifications, scheduleReviewNotification } from "@/hooks/useNotifications";
import { scheduleFirstReview as fsrsScheduleFirst, applyRating as fsrsApplyRating, type FsrsRating, type FsrsCardState, type ReviewResult } from "@/lib/fsrs";
import { API_BASE } from "@/lib/api";
import { streakRequiredForPhase } from "@/lib/streakRequirements";

const API_BASE_URL = API_BASE;
if (!API_BASE_URL) {
  console.error(
    "[AppContext] EXPO_PUBLIC_API_BASE_URL is not set. " +
      "Add it to .env.local for local dev, or to EAS secrets for production builds.",
  );
}
const STORAGE_KEY_TEXTS = "@memorizer:texts";
const STORAGE_KEY_SESSIONS = "@memorizer:sessions";
const STORAGE_KEY_NOTIF = "memorizer_notification_settings";
const STORAGE_KEY_PENDING_REVIEWS = "@memorizer:pendingReviews";

type PendingReview = {
  textId: string;
  rating: number;
  reviewedAt: string;
  nextDue: string;
  stability: number;
  difficulty: number;
  intervalDays: number;
};

async function loadPendingReviews(): Promise<PendingReview[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_PENDING_REVIEWS);
    return raw ? (JSON.parse(raw) as PendingReview[]) : [];
  } catch {
    return [];
  }
}

async function appendPendingReview(review: PendingReview): Promise<void> {
  try {
    const existing = await loadPendingReviews();
    existing.push(review);
    await AsyncStorage.setItem(STORAGE_KEY_PENDING_REVIEWS, JSON.stringify(existing));
  } catch {}
}

async function clearPendingReviews(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_PENDING_REVIEWS);
  } catch {}
}

export type ContentType =
  | "ordered-list"
  | "definition"
  | "dialogue"
  | "long-form"
  | "passage";
export type StudyMode = "mnemonic" | "intensive" | "standard" | "spaced";

export interface ChunkEntry {
  index: number;
  content: string;
  phase: number;
  recallPct: number;
  isUnlocked: boolean;
  consecutiveGoodSessions: number;
  sessionCountInPhase: number;
}

export function getModeForDays(days: number): StudyMode {
  if (days <= 3) return "mnemonic";
  if (days <= 7) return "intensive";
  if (days <= 30) return "standard";
  return "spaced";
}

export interface TextEntry {
  id: string;
  title: string;
  content: string;
  phase: number;
  totalPhases: number;
  recallPct: number;
  nextSessionLabel: string;
  nextSessionTime: string;
  nextSessionAt?: string;
  deadlineDate?: string;
  daysLeft: number;
  phaseColor: string;
  updatedAt?: string;
  notificationsEnabled: boolean;
  consecutiveGoodSessions: number;
  sessionCountInPhase: number;
  contentType?: ContentType;
  myCharacterName?: string | null;
  mode?: StudyMode;
  isTightDeadline?: boolean;
  nextReviewDue?: string;
  fsrsStability?: number;
  fsrsDifficulty?: number;
  fsrsReps?: number;
  fsrsLapses?: number;
  fsrsState?: number;
  fsrsLastReview?: string;
  lastFlashDate?: string;
  chunks?: ChunkEntry[];
}

export { type FsrsRating };

export interface SessionEntry {
  id: string;
  textId: string;
  phase: number;
  score: number;
  completedAt: string;
  chunkIndex?: number;
}

interface NotificationSettings {
  globalEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  permissionAsked: boolean;
}

interface AppContextValue {
  texts: TextEntry[];
  sessions: SessionEntry[];
  pendingText: string;
  pendingTitle: string;
  pendingDeadlineDate: Date | null;
  pendingTextId: string | null;
  pendingUseChunks: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  notificationSettings: NotificationSettings;
  setPendingText: (t: string) => void;
  setPendingTitle: (t: string) => void;
  setPendingDeadlineDate: (d: Date | null) => void;
  setPendingTextId: (id: string | null) => void;
  setPendingUseChunks: (v: boolean) => void;
  addText: (entry: TextEntry) => Promise<TextEntry>;
  updateText: (id: string, updates: Partial<TextEntry>) => Promise<void>;
  advancePhase: (textId: string) => void;
  markAsMastered: (textId: string) => void;
  advanceChunkPhase: (textId: string, chunkIndex: number) => void;
  recordChunkSession: (session: SessionEntry & { chunkIndex: number }, score: number, threshold: number) => Promise<void>;
  getActiveChunk: (textId: string) => ChunkEntry | null;
  deleteText: (id: string) => Promise<void>;
  recordSession: (session: SessionEntry) => Promise<void>;
  syncWithServer: () => Promise<void>;
  updateTextNotification: (textId: string, enabled: boolean) => void;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  submitReview: (textId: string, rating: FsrsRating) => Promise<void>;
  recordFlash: (textId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  globalEnabled: false,
  reminderHour: 16,
  reminderMinute: 0,
  permissionAsked: false,
};

// IDs that were previously hard-coded seed texts — strip them if still in storage
const LEGACY_SEED_IDS = new Set(["1", "2"]);

async function apiCall<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

function serverRowToEntry(row: Record<string, unknown>): TextEntry {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    phase: (row.phase as number) ?? 1,
    totalPhases: (row.totalPhases as number) ?? 3,
    recallPct: (row.recallPct as number) ?? 0,
    nextSessionLabel: (row.nextSessionLabel as string) ?? "",
    nextSessionTime: (row.nextSessionTime as string) ?? "",
    daysLeft: (row.daysLeft as number) ?? 0,
    deadlineDate: (row.deadlineDate as string | undefined) ?? (row.deadline_date as string | undefined),
    phaseColor: (row.phaseColor as string) ?? "#818CF8",
    updatedAt: row.updatedAt as string | undefined,
    notificationsEnabled: (row.notificationsEnabled as boolean) ?? true,
    consecutiveGoodSessions: (row.consecutiveGoodSessions as number) ?? 0,
    sessionCountInPhase: (row.sessionCountInPhase as number) ?? 0,
    contentType: ((row.contentType ?? row.content_type) as ContentType | undefined) ?? "passage",
    myCharacterName: (row.myCharacterName ?? row.my_character_name) as string | undefined | null,
    mode: ((row.mode) as StudyMode | undefined),
    isTightDeadline: (row.isTightDeadline ?? row.is_tight_deadline) as boolean | undefined,
    nextReviewDue: (row.nextReviewDue ?? row.next_review_due) as string | undefined,
    fsrsStability: (row.fsrsStability ?? row.fsrs_stability) as number | undefined,
    fsrsDifficulty: (row.fsrsDifficulty ?? row.fsrs_difficulty) as number | undefined,
    fsrsReps: (row.fsrsReps ?? row.fsrs_reps) as number | undefined,
    fsrsLapses: (row.fsrsLapses ?? row.fsrs_lapses) as number | undefined,
    fsrsState: (row.fsrsState ?? row.fsrs_state) as number | undefined,
    fsrsLastReview: (row.fsrsLastReview ?? row.fsrs_last_review) as string | undefined,
    lastFlashDate: (row.lastFlashDate ?? row.last_flash_date) as string | undefined,
    chunks: (row.chunks ?? row.chunks) as ChunkEntry[] | undefined,
  };
}

function serverSessionToEntry(row: Record<string, unknown>): SessionEntry {
  return {
    id: row.id as string,
    textId: (row.textId ?? row.text_id) as string,
    phase: row.phase as number,
    score: (row.score as number) ?? 0,
    completedAt: (row.completedAt ?? row.completed_at) as string,
    chunkIndex: (row.chunkIndex ?? row.chunk_index) as number | undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, getValidToken } = useAuth();
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [pendingText, setPendingText] = useState<string>("");
  const [pendingTitle, setPendingTitle] = useState<string>("");
  const [pendingDeadlineDate, setPendingDeadlineDate] = useState<Date | null>(null);
  const [pendingTextId, setPendingTextId] = useState<string | null>(null);
  const [pendingUseChunks, setPendingUseChunks] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>(DEFAULT_NOTIF_SETTINGS);

  useEffect(() => {
    loadLocalData();
  }, []);

  useEffect(() => {
    if (initialized && user) {
      syncWithServer();
    }
  }, [user, initialized]);

  // Persist notification settings whenever they change (after init)
  useEffect(() => {
    if (!initialized) return;
    AsyncStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(notificationSettings)).catch(() => {});
  }, [notificationSettings, initialized]);

  async function loadLocalData() {
    try {
      const [storedTexts, storedSessions, storedNotif] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_TEXTS),
        AsyncStorage.getItem(STORAGE_KEY_SESSIONS),
        AsyncStorage.getItem(STORAGE_KEY_NOTIF),
      ]);

      // Strip any legacy hardcoded seed texts (ids "1" and "2") from stored data
      const parsed: TextEntry[] = storedTexts ? JSON.parse(storedTexts) : [];
      const cleaned = parsed.filter((t) => !LEGACY_SEED_IDS.has(t.id));
      if (cleaned.length !== parsed.length) {
        // Persist the cleaned list so seeds don't come back on next load
        await AsyncStorage.setItem(STORAGE_KEY_TEXTS, JSON.stringify(cleaned));
      }
      setTexts(cleaned);

      setSessions(storedSessions ? JSON.parse(storedSessions) : []);
      if (storedNotif) {
        setNotificationSettingsState(JSON.parse(storedNotif));
      }
    } catch (err) {
      console.warn("[Verbitra] Failed to load local data, using defaults:", err);
      setTexts([]);
      setSessions([]);
    } finally {
      setInitialized(true);
    }
  }

  async function persistLocalTexts(nextTexts: TextEntry[]) {
    await AsyncStorage.setItem(STORAGE_KEY_TEXTS, JSON.stringify(nextTexts));
  }

  async function persistLocalSessions(nextSessions: SessionEntry[]) {
    await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(nextSessions));
  }

  const syncWithServer = useCallback(async () => {
    const token = await getValidToken();
    if (!token) return;

    setIsSyncing(true);
    try {
      const [storedTexts, storedSessions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_TEXTS),
        AsyncStorage.getItem(STORAGE_KEY_SESSIONS),
      ]);
      const textList: TextEntry[] = storedTexts ? JSON.parse(storedTexts) : [];
      const sessionList: SessionEntry[] = storedSessions ? JSON.parse(storedSessions) : [];

      const syncPayload = {
        texts: textList.map((t) => ({
          id: t.id,
          title: t.title,
          content: t.content,
          phase: t.phase,
          totalPhases: t.totalPhases,
          recallPct: t.recallPct,
          phaseColor: t.phaseColor,
          nextSessionTime: t.nextSessionTime,
          nextSessionLabel: t.nextSessionLabel,
          daysLeft: t.daysLeft,
          deadlineDate: t.deadlineDate,
          consecutiveGoodSessions: t.consecutiveGoodSessions ?? 0,
          sessionCountInPhase: t.sessionCountInPhase ?? 0,
          contentType: t.contentType ?? "passage",
          myCharacterName: t.myCharacterName ?? null,
          mode: t.mode ?? null,
          isTightDeadline: t.isTightDeadline ?? null,
          nextReviewDue: t.nextReviewDue ?? null,
          fsrsStability: t.fsrsStability ?? null,
          fsrsDifficulty: t.fsrsDifficulty ?? null,
          fsrsReps: t.fsrsReps ?? null,
          fsrsLapses: t.fsrsLapses ?? null,
          fsrsState: t.fsrsState ?? null,
          fsrsLastReview: t.fsrsLastReview ?? null,
          lastFlashDate: t.lastFlashDate ?? null,
          chunks: t.chunks ?? null,
          updatedAt: t.updatedAt ?? new Date().toISOString(),
        })),
        sessions: sessionList.map((s) => ({
          id: s.id,
          textId: s.textId,
          phase: s.phase,
          score: s.score,
          completedAt: s.completedAt,
          chunkIndex: s.chunkIndex ?? null,
        })),
      };

      const result = await apiCall<{
        texts: Record<string, unknown>[];
        sessions: Record<string, unknown>[];
        idMapping: Record<string, string>;
      }>(
        "/sync",
        { method: "POST", body: JSON.stringify(syncPayload) },
        token,
      );

      const mergedTexts = result.texts.map(serverRowToEntry);
      const mergedSessions = (result.sessions ?? []).map(serverSessionToEntry);

      const remappedSessions = mergedSessions.map((s) => ({
        ...s,
        textId: result.idMapping[s.textId] ?? s.textId,
      }));

      setTexts(mergedTexts);
      setSessions(remappedSessions);
      await Promise.all([
        persistLocalTexts(mergedTexts),
        persistLocalSessions(remappedSessions),
      ]);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn("[Verbitra] Server sync failed, using local data:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [getValidToken]);

  const addText = useCallback(
    async (entry: TextEntry): Promise<TextEntry> => {
      const entryWithDefaults = {
        ...entry,
        updatedAt: new Date().toISOString(),
        notificationsEnabled: entry.notificationsEnabled ?? true,
        consecutiveGoodSessions: entry.consecutiveGoodSessions ?? 0,
        sessionCountInPhase: entry.sessionCountInPhase ?? 0,
      };
      const token = await getValidToken();

      if (token) {
        try {
          const data = await apiCall<{ text: Record<string, unknown> }>(
            "/texts",
            {
              method: "POST",
              body: JSON.stringify({
                title: entry.title,
                content: entry.content,
                phase: entry.phase,
                totalPhases: entry.totalPhases,
                recallPct: entry.recallPct,
                phaseColor: entry.phaseColor,
                nextSessionTime: entry.nextSessionTime,
                nextSessionLabel: entry.nextSessionLabel,
                daysLeft: entry.daysLeft,
                deadlineDate: entry.deadlineDate,
                consecutiveGoodSessions: entry.consecutiveGoodSessions ?? 0,
                sessionCountInPhase: entry.sessionCountInPhase ?? 0,
                contentType: entry.contentType ?? "passage",
                myCharacterName: entry.myCharacterName ?? null,
                mode: entry.mode ?? null,
                isTightDeadline: entry.isTightDeadline ?? null,
                chunks: entry.chunks ?? null,
              }),
            },
            token,
          );
          const serverEntry = serverRowToEntry(data.text);
          setTexts((prev) => {
            const next = [...prev, serverEntry];
            persistLocalTexts(next);
            return next;
          });
          return serverEntry;
        } catch (err) {
          console.warn("[Verbitra] addText API call failed, falling back to local:", err);
        }
      }

      setTexts((prev) => {
        const next = [...prev, entryWithDefaults];
        persistLocalTexts(next);
        return next;
      });
      return entryWithDefaults;
    },
    [getValidToken],
  );

  const updateText = useCallback(
    async (id: string, updates: Partial<TextEntry>) => {
      const token = await getValidToken();
      const updatesWithTimestamp = { ...updates, updatedAt: new Date().toISOString() };

      if (token) {
        try {
          await apiCall(`/texts/${id}`, {
            method: "PATCH",
            body: JSON.stringify(updates),
          }, token);
        } catch (err) {
          console.warn("[Verbitra] updateText API call failed, updated locally only:", err);
        }
      }

      setTexts((prev) => {
        const next = prev.map((t) =>
          t.id === id ? { ...t, ...updatesWithTimestamp } : t,
        );
        persistLocalTexts(next);
        return next;
      });
    },
    [getValidToken],
  );

  const advancePhase = useCallback(
    (id: string) => {
      const now = new Date();
      const nowIso = now.toISOString();
      let masteredFsrs: { nextReviewDue: string; cardState: ReturnType<typeof fsrsScheduleFirst>["cardState"]; textMode: string | undefined } | null = null;

      setTexts((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        const nextPhase = target.phase + 1;
        const isMastered = nextPhase > target.totalPhases;
        const nextColor = isMastered ? "#4ADE80" : nextPhase >= target.totalPhases ? "#4ADE80" : "#FB923C";

        let fsrsUpdates: Partial<TextEntry> = {};
        if (isMastered) {
          const textMode = target.mode ?? getModeForDays(target.daysLeft);
          if (textMode === "standard" || textMode === "spaced") {
            const result = fsrsScheduleFirst(now);
            fsrsUpdates = {
              nextReviewDue: result.nextDue,
              fsrsStability: result.cardState.stability,
              fsrsDifficulty: result.cardState.difficulty,
              fsrsReps: result.cardState.reps,
              fsrsLapses: result.cardState.lapses,
              fsrsState: result.cardState.state,
              fsrsLastReview: result.cardState.lastReview,
            };
            masteredFsrs = { nextReviewDue: result.nextDue, cardState: result.cardState, textMode };
          }
        }

        const next = prev.map((t) =>
          t.id === id
            ? { ...t, phase: nextPhase, phaseColor: nextColor, updatedAt: nowIso, ...fsrsUpdates }
            : t,
        );
        persistLocalTexts(next);
        return next;
      });

      getValidToken().then((token) => {
        if (!token) return;
        setTexts((current) => {
          const updated = current.find((t) => t.id === id);
          if (!updated) return current;
          const patchBody: Record<string, unknown> = {
            phase: updated.phase,
            phaseColor: updated.phaseColor,
          };
          if (masteredFsrs) {
            patchBody.nextReviewDue = updated.nextReviewDue;
            patchBody.fsrsStability = updated.fsrsStability;
            patchBody.fsrsDifficulty = updated.fsrsDifficulty;
            patchBody.fsrsReps = updated.fsrsReps;
            patchBody.fsrsLapses = updated.fsrsLapses;
            patchBody.fsrsState = updated.fsrsState;
            patchBody.fsrsLastReview = updated.fsrsLastReview;

            if (notificationSettings.globalEnabled && updated.notificationsEnabled && updated.nextReviewDue) {
              scheduleReviewNotification({
                textId: id,
                textTitle: updated.title,
                reviewDue: new Date(updated.nextReviewDue),
              }).catch(() => {});
            }

            const masteredAt = updated.updatedAt ?? new Date().toISOString();
            const initialReview: PendingReview = {
              textId: id,
              rating: 3,
              reviewedAt: masteredAt,
              nextDue: masteredFsrs.nextReviewDue,
              stability: masteredFsrs.cardState.stability,
              difficulty: masteredFsrs.cardState.difficulty,
              intervalDays: Math.round(
                (new Date(masteredFsrs.nextReviewDue).getTime() - new Date(masteredAt).getTime()) / 86400000,
              ),
            };
            apiCall(
              "/reviews",
              { method: "POST", body: JSON.stringify(initialReview) },
              token,
            ).catch(() => appendPendingReview(initialReview));
          }
          apiCall(
            `/texts/${id}`,
            { method: "PATCH", body: JSON.stringify(patchBody) },
            token,
          ).catch((err: unknown) =>
            console.warn("[Verbitra] advancePhase API call failed:", err),
          );
          return current;
        });
      }).catch(() => {});
    },
    [notificationSettings, getValidToken],
  );

  const markAsMastered = useCallback(
    (id: string) => {
      const now = new Date();
      const nowIso = now.toISOString();
      let masteredFsrs: { nextReviewDue: string; cardState: ReturnType<typeof fsrsScheduleFirst>["cardState"]; textMode: string | undefined } | null = null;

      setTexts((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        const masteredPhase = target.totalPhases + 1;
        const textMode = target.mode ?? getModeForDays(target.daysLeft);
        let fsrsUpdates: Partial<TextEntry> = {};
        if (textMode === "standard" || textMode === "spaced") {
          const result = fsrsScheduleFirst(now);
          fsrsUpdates = {
            nextReviewDue: result.nextDue,
            fsrsStability: result.cardState.stability,
            fsrsDifficulty: result.cardState.difficulty,
            fsrsReps: result.cardState.reps,
            fsrsLapses: result.cardState.lapses,
            fsrsState: result.cardState.state,
            fsrsLastReview: result.cardState.lastReview,
          };
          masteredFsrs = { nextReviewDue: result.nextDue, cardState: result.cardState, textMode };
        }
        const next = prev.map((t) =>
          t.id === id
            ? { ...t, phase: masteredPhase, phaseColor: "#4ADE80", updatedAt: nowIso, ...fsrsUpdates }
            : t,
        );
        persistLocalTexts(next);
        return next;
      });

      getValidToken().then((token) => {
        if (!token) return;
        setTexts((current) => {
          const updated = current.find((t) => t.id === id);
          if (!updated) return current;
          const patchBody: Record<string, unknown> = {
            phase: updated.phase,
            phaseColor: updated.phaseColor,
          };
          if (masteredFsrs) {
            patchBody.nextReviewDue = updated.nextReviewDue;
            patchBody.fsrsStability = updated.fsrsStability;
            patchBody.fsrsDifficulty = updated.fsrsDifficulty;
            patchBody.fsrsReps = updated.fsrsReps;
            patchBody.fsrsLapses = updated.fsrsLapses;
            patchBody.fsrsState = updated.fsrsState;
            patchBody.fsrsLastReview = updated.fsrsLastReview;

            if (notificationSettings.globalEnabled && updated.notificationsEnabled && updated.nextReviewDue) {
              scheduleReviewNotification({
                textId: id,
                textTitle: updated.title,
                reviewDue: new Date(updated.nextReviewDue),
              }).catch(() => {});
            }

            const masteredAt = updated.updatedAt ?? nowIso;
            const initialReview: PendingReview = {
              textId: id,
              rating: 3,
              reviewedAt: masteredAt,
              nextDue: masteredFsrs.nextReviewDue,
              stability: masteredFsrs.cardState.stability,
              difficulty: masteredFsrs.cardState.difficulty,
              intervalDays: Math.round(
                (new Date(masteredFsrs.nextReviewDue).getTime() - new Date(masteredAt).getTime()) / 86400000,
              ),
            };
            apiCall(
              "/reviews",
              { method: "POST", body: JSON.stringify(initialReview) },
              token,
            ).catch(() => appendPendingReview(initialReview));
          }
          apiCall(
            `/texts/${id}`,
            { method: "PATCH", body: JSON.stringify(patchBody) },
            token,
          ).catch((err: unknown) =>
            console.warn("[Verbitra] markAsMastered API call failed:", err),
          );
          return current;
        });
      }).catch(() => {});
    },
    [notificationSettings, getValidToken],
  );

  const submitReview = useCallback(
    async (textId: string, rating: FsrsRating) => {
      const now = new Date();

      // Compute FSRS result from current texts snapshot (outside setState to keep TS types clean)
      const target = texts.find((t) => t.id === textId);
      if (!target) return;

      const existing: FsrsCardState | null = (target.fsrsState != null)
        ? {
            stability: target.fsrsStability ?? 3,
            difficulty: target.fsrsDifficulty ?? 5,
            reps: target.fsrsReps ?? 1,
            lapses: target.fsrsLapses ?? 0,
            state: target.fsrsState,
            lastReview: target.fsrsLastReview ?? now.toISOString(),
          }
        : null;

      const reviewResult: ReviewResult = fsrsApplyRating(rating, existing, now);
      const { nextDue, cardState } = reviewResult;

      const pendingReview: PendingReview = {
        textId,
        rating,
        reviewedAt: now.toISOString(),
        nextDue,
        stability: cardState.stability,
        difficulty: cardState.difficulty,
        intervalDays: Math.round(
          (new Date(nextDue).getTime() - now.getTime()) / 86400000,
        ),
      };

      setTexts((prev) => {
        const next = prev.map((t) =>
          t.id === textId
            ? {
                ...t,
                nextReviewDue: nextDue,
                fsrsStability: cardState.stability,
                fsrsDifficulty: cardState.difficulty,
                fsrsReps: cardState.reps,
                fsrsLapses: cardState.lapses,
                fsrsState: cardState.state,
                fsrsLastReview: cardState.lastReview,
                updatedAt: now.toISOString(),
              }
            : t,
        );
        persistLocalTexts(next);
        return next;
      });

      await appendPendingReview(pendingReview);

      const token = await getValidToken();

      if (token) {
        apiCall(
          `/texts/${textId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              nextReviewDue: nextDue,
              fsrsStability: cardState.stability,
              fsrsDifficulty: cardState.difficulty,
              fsrsReps: cardState.reps,
              fsrsLapses: cardState.lapses,
              fsrsState: cardState.state,
              fsrsLastReview: cardState.lastReview,
            }),
          },
          token,
        ).catch((err: unknown) =>
          console.warn("[Verbitra] submitReview patch failed:", err),
        );

        const pending = await loadPendingReviews();
        const failedIndexes: number[] = [];
        await Promise.all(
          pending.map((r, i) =>
            apiCall(
              "/reviews",
              { method: "POST", body: JSON.stringify(r) },
              token,
            ).catch(() => {
              failedIndexes.push(i);
            }),
          ),
        );
        const remaining = pending.filter((_, i) => failedIndexes.includes(i));
        if (remaining.length === 0) {
          await clearPendingReviews();
        } else {
          await AsyncStorage.setItem(
            STORAGE_KEY_PENDING_REVIEWS,
            JSON.stringify(remaining),
          );
        }
      }

      setTexts((current) => {
        const updated = current.find((t) => t.id === textId);
        if (notificationSettings.globalEnabled && updated?.notificationsEnabled && updated.nextReviewDue) {
          scheduleReviewNotification({
            textId,
            textTitle: updated.title,
            reviewDue: new Date(updated.nextReviewDue),
          }).catch(() => {});
        }
        return current;
      });
    },
    [texts, notificationSettings, getValidToken],
  );

  const recordFlash = useCallback(
    async (textId: string) => {
      const now = new Date().toISOString();
      setTexts((prev) => {
        const next = prev.map((t) =>
          t.id === textId ? { ...t, lastFlashDate: now, updatedAt: now } : t,
        );
        persistLocalTexts(next);
        return next;
      });
      const token = await getValidToken();
      if (token) {
        apiCall(
          `/texts/${textId}`,
          { method: "PATCH", body: JSON.stringify({ lastFlashDate: now }) },
          token,
        ).catch((err: unknown) =>
          console.warn("[Verbitra] recordFlash patch failed:", err),
        );
      }
    },
    [getValidToken],
  );

  const advanceChunkPhase = useCallback(
    (textId: string, chunkIndex: number) => {
      setTexts((prev) => {
        const target = prev.find((t) => t.id === textId);
        if (!target || !target.chunks) return prev;
        const chunks = target.chunks.map((c) => {
          if (c.index !== chunkIndex) return c;
          const nextPhase = c.phase + 1;
          return {
            ...c,
            phase: nextPhase,
            consecutiveGoodSessions: 0,
            sessionCountInPhase: 0,
          };
        });
        // Unlock next chunk only when current chunk is mastered (phase > 3)
        const advanced = chunks.find((c) => c.index === chunkIndex);
        if (advanced && advanced.phase > 3) {
          const nextChunk = chunks.find((c) => c.index === chunkIndex + 1);
          if (nextChunk && !nextChunk.isUnlocked) {
            chunks[chunkIndex + 1] = { ...nextChunk, isUnlocked: true };
          }
        }
        const now = new Date().toISOString();
        const next = prev.map((t) =>
          t.id === textId ? { ...t, chunks, updatedAt: now } : t,
        );
        persistLocalTexts(next);
        return next;
      });

      getValidToken().then((token) => {
        if (!token) return;
        setTexts((current) => {
          const updated = current.find((t) => t.id === textId);
          if (!updated) return current;
          apiCall(
            `/texts/${textId}`,
            { method: "PATCH", body: JSON.stringify({ chunks: updated.chunks }) },
            token,
          ).catch((err: unknown) =>
            console.warn("[Verbitra] advanceChunkPhase API call failed:", err),
          );
          return current;
        });
      }).catch(() => {});
    },
    [getValidToken],
  );

  const recordChunkSession = useCallback(
    async (session: SessionEntry & { chunkIndex: number }, score: number, threshold: number) => {
      const now = new Date().toISOString();
      let didAdvance = false;

      setTexts((prev) => {
        const target = prev.find((t) => t.id === session.textId);
        if (!target || !target.chunks) return prev;
        const chunks = target.chunks.map((c) => {
          if (c.index !== session.chunkIndex) return c;
          const passing = score >= threshold;
          // On fail, preserve the streak so the user repeats the *current*
          // activity rung instead of being demoted back to the first rung.
          const newConsec = passing ? c.consecutiveGoodSessions + 1 : c.consecutiveGoodSessions;
          const newCount = c.sessionCountInPhase + 1;
          const streakReq = streakRequiredForPhase(c.phase);
          const shouldAdvance = passing && newConsec >= streakReq && c.phase < 4;
          if (shouldAdvance) didAdvance = true;
          return {
            ...c,
            recallPct: score,
            consecutiveGoodSessions: shouldAdvance ? 0 : newConsec,
            sessionCountInPhase: shouldAdvance ? 0 : newCount,
            phase: shouldAdvance ? c.phase + 1 : c.phase,
          };
        });
        // Unlock next chunk only when current chunk is mastered (phase > 3)
        const advanced = chunks.find((c) => c.index === session.chunkIndex);
        if (didAdvance && advanced && advanced.phase > 3) {
          const nextIdx = session.chunkIndex + 1;
          if (nextIdx < chunks.length && !chunks[nextIdx].isUnlocked) {
            chunks[nextIdx] = { ...chunks[nextIdx], isUnlocked: true };
          }
        }
        const next = prev.map((t) =>
          t.id === session.textId ? { ...t, chunks, updatedAt: now } : t,
        );
        persistLocalTexts(next);
        return next;
      });

      // Record the session
      setSessions((prev) => {
        const alreadyExists = prev.some((s) => s.id === session.id);
        if (alreadyExists) return prev;
        const next = [...prev, session];
        persistLocalSessions(next);
        return next;
      });

      const token = await getValidToken();
      if (!token) return;

      try {
        await Promise.all([
          apiCall(
            "/sessions",
            {
              method: "POST",
              body: JSON.stringify({
                id: session.id,
                textId: session.textId,
                phase: session.phase,
                score: session.score,
                completedAt: session.completedAt,
                chunkIndex: session.chunkIndex,
              }),
            },
            token,
          ),
          new Promise<unknown>((resolve, reject) => {
            setTexts((current) => {
              const target = current.find((t) => t.id === session.textId);
              if (!target) { resolve(undefined); return current; }
              apiCall(
                `/texts/${session.textId}`,
                { method: "PATCH", body: JSON.stringify({ chunks: target.chunks }) },
                token,
              ).then(resolve).catch(reject);
              return current;
            });
          }),
        ]);
      } catch (err) {
        console.warn("[Verbitra] recordChunkSession failed:", err);
      }
    },
    [getValidToken],
  );

  const getActiveChunk = useCallback(
    (textId: string): ChunkEntry | null => {
      const target = texts.find((t) => t.id === textId);
      if (!target?.chunks?.length) return null;
      return target.chunks.find((c) => c.isUnlocked && c.phase <= 3) ?? null;
    },
    [texts],
  );

  const deleteText = useCallback(
    async (id: string) => {
      const token = await getValidToken();

      if (token) {
        try {
          await apiCall(`/texts/${id}`, { method: "DELETE" }, token);
        } catch (err) {
          console.warn("[Verbitra] deleteText API call failed, deleted locally only:", err);
        }
      }

      setTexts((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persistLocalTexts(next);
        return next;
      });

      setSessions((prev) => {
        const next = prev.filter((s) => s.textId !== id);
        persistLocalSessions(next);
        return next;
      });
    },
    [getValidToken],
  );

  const recordSession = useCallback(
    async (session: SessionEntry) => {
      // Update the text's recallPct to reflect this session's score
      if (session.textId && session.textId !== "demo") {
        setTexts((prev) => {
          const next = prev.map((t) =>
            t.id === session.textId ? { ...t, recallPct: session.score } : t
          );
          persistLocalTexts(next);
          return next;
        });
      }

      setSessions((prev) => {
        const alreadyExists = prev.some((s) => s.id === session.id);
        if (alreadyExists) return prev;
        const next = [...prev, session];
        persistLocalSessions(next);
        return next;
      });

      const token = await getValidToken();
      if (!token) return;

      try {
        await apiCall(
          "/sessions",
          {
            method: "POST",
            body: JSON.stringify({
              id: session.id,
              textId: session.textId,
              phase: session.phase,
              score: session.score,
              completedAt: session.completedAt,
              chunkIndex: session.chunkIndex ?? null,
            }),
          },
          token,
        );
      } catch (err) {
        console.warn("[Verbitra] recordSession API call failed, session saved locally only:", err);
      }
    },
    [getValidToken],
  );

  const updateTextNotification = (textId: string, enabled: boolean) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === textId ? { ...t, notificationsEnabled: enabled } : t))
    );
    if (!enabled) {
      cancelTextNotifications(textId);
    }
  };

  const setNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettingsState((prev) => {
      const next = { ...prev, ...settings };
      if (!next.globalEnabled) {
        cancelAllNotifications();
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      texts,
      sessions,
      pendingText,
      pendingTitle,
      pendingDeadlineDate,
      pendingTextId,
      pendingUseChunks,
      isSyncing,
      lastSyncedAt,
      notificationSettings,
      setPendingText,
      setPendingTitle,
      setPendingDeadlineDate,
      setPendingTextId,
      setPendingUseChunks,
      addText,
      updateText,
      advancePhase,
      markAsMastered,
      advanceChunkPhase,
      recordChunkSession,
      getActiveChunk,
      deleteText,
      recordSession,
      syncWithServer,
      updateTextNotification,
      setNotificationSettings,
      submitReview,
      recordFlash,
    }),
    [
      texts,
      sessions,
      pendingText,
      pendingTitle,
      pendingDeadlineDate,
      pendingTextId,
      pendingUseChunks,
      isSyncing,
      lastSyncedAt,
      notificationSettings,
      addText,
      updateText,
      advancePhase,
      markAsMastered,
      advanceChunkPhase,
      recordChunkSession,
      getActiveChunk,
      deleteText,
      recordSession,
      syncWithServer,
      submitReview,
      recordFlash,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
