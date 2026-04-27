import type { VerbitraText, Session } from "./types";
import { calcNextSessionDate } from "./scheduler";

const TOTAL_PHASES = 3;
const PHASE_THRESHOLD = 0.75;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function updateProgress(
  text: VerbitraText,
  score: number,
  correct: number,
  total: number,
  hintsUsed: number,
  now = new Date().toISOString(),
): VerbitraText {
  const session: Session = {
    id: generateId(),
    textId: text.id,
    completedAt: now,
    score,
    correct,
    total,
    hintsUsed,
    phase: text.currentPhase,
  };

  const newHistory = [...text.sessionHistory, session];

  const sessionsInPhase = newHistory.filter((s) => s.phase === text.currentPhase);
  const avgScore =
    sessionsInPhase.reduce((sum, s) => sum + s.score, 0) / sessionsInPhase.length;

  let newPhase = text.currentPhase;
  if (avgScore >= PHASE_THRESHOLD * 100 && text.currentPhase < TOTAL_PHASES) {
    newPhase = text.currentPhase + 1;
  }

  const nextSessionDate = text.deadlineConfig
    ? calcNextSessionDate(newHistory, text.deadlineConfig, now)
    : now;

  return {
    ...text,
    currentPhase: newPhase,
    sessionHistory: newHistory,
    nextSessionDate,
    lastRecallPct: score,
  };
}
