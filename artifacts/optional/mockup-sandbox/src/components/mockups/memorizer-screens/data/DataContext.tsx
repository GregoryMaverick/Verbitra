import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { VerbitraText, Session, DeadlineConfig } from "./types";
import { loadTexts, saveTexts, loadSessions, saveSessions } from "./storage";
import { calcDeadlineMode } from "./deadlineMode";
import { calcNextSessionDate } from "./scheduler";
import { updateProgress } from "./progressTracker";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface DataContextValue {
  texts: VerbitraText[];
  addText: (content: string, deadlineDate: string | null) => VerbitraText;
  updateText: (id: string, patch: Partial<VerbitraText>) => void;
  deleteText: (id: string) => void;
  setDeadline: (textId: string, deadlineDate: string) => void;
  completeSession: (
    textId: string,
    score: number,
    correct: number,
    total: number,
    hintsUsed: number,
  ) => void;
  useText: (id: string) => VerbitraText | undefined;
  useSessions: (textId: string) => Session[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [texts, setTexts] = useState<VerbitraText[]>(() => loadTexts());
  const [allSessions, setAllSessions] = useState<Session[]>(() => loadSessions());

  useEffect(() => {
    saveTexts(texts);
  }, [texts]);

  useEffect(() => {
    saveSessions(allSessions);
  }, [allSessions]);

  const addText = useCallback((content: string, deadlineDate: string | null): VerbitraText => {
    const wordCount = countWords(content);
    const now = new Date().toISOString();
    const deadlineConfig: DeadlineConfig | null = deadlineDate
      ? calcDeadlineMode(new Date().toISOString().split("T")[0], deadlineDate, wordCount)
      : null;

    const nextSessionDate = deadlineConfig
      ? calcNextSessionDate([], deadlineConfig, now)
      : now;

    const text: VerbitraText = {
      id: generateId(),
      content,
      wordCount,
      createdAt: now,
      deadlineConfig,
      currentPhase: 1,
      totalPhases: 3,
      sessionHistory: [],
      nextSessionDate,
      lastRecallPct: null,
    };

    setTexts((prev) => {
      const next = [...prev, text];
      saveTexts(next);
      return next;
    });

    return text;
  }, []);

  const updateText = useCallback((id: string, patch: Partial<VerbitraText>) => {
    setTexts((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      saveTexts(next);
      return next;
    });
  }, []);

  const deleteText = useCallback((id: string) => {
    setTexts((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTexts(next);
      return next;
    });
    setAllSessions((prev) => {
      const next = prev.filter((s) => s.textId !== id);
      saveSessions(next);
      return next;
    });
  }, []);

  const setDeadline = useCallback((textId: string, deadlineDate: string) => {
    setTexts((prev) => {
      const text = prev.find((t) => t.id === textId);
      if (!text) return prev;
      const today = new Date().toISOString().split("T")[0];
      const deadlineConfig = calcDeadlineMode(today, deadlineDate, text.wordCount);
      const nextSessionDate = calcNextSessionDate(
        text.sessionHistory,
        deadlineConfig,
        new Date().toISOString(),
      );
      const next = prev.map((t) =>
        t.id === textId ? { ...t, deadlineConfig, nextSessionDate } : t,
      );
      saveTexts(next);
      return next;
    });
  }, []);

  const completeSession = useCallback(
    (textId: string, score: number, correct: number, total: number, hintsUsed: number) => {
      setTexts((prev) => {
        const text = prev.find((t) => t.id === textId);
        if (!text) return prev;
        const updated = updateProgress(text, score, correct, total, hintsUsed);
        const newSession = updated.sessionHistory[updated.sessionHistory.length - 1];
        setAllSessions((prevSessions) => {
          const next = [...prevSessions, newSession];
          saveSessions(next);
          return next;
        });
        const next = prev.map((t) => (t.id === textId ? updated : t));
        saveTexts(next);
        return next;
      });
    },
    [],
  );

  const useText = useCallback(
    (id: string) => texts.find((t) => t.id === id),
    [texts],
  );

  const useSessions = useCallback(
    (textId: string) => allSessions.filter((s) => s.textId === textId),
    [allSessions],
  );

  const value = useMemo(
    () => ({
      texts,
      addText,
      updateText,
      deleteText,
      setDeadline,
      completeSession,
      useText,
      useSessions,
    }),
    [texts, addText, updateText, deleteText, setDeadline, completeSession, useText, useSessions],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function useTexts(): VerbitraText[] {
  return useData().texts;
}

export function useText(id: string): VerbitraText | undefined {
  return useData().useText(id);
}

export function useSessions(textId: string): Session[] {
  return useData().useSessions(textId);
}

export function useProgress(textId: string) {
  const { texts, useSessions: getSessions } = useData();
  const text = texts.find((t) => t.id === textId);
  const sessions = getSessions(textId);
  return { text, sessions };
}
