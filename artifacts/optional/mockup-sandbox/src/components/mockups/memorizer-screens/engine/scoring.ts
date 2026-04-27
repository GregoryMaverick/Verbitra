import { WordState } from "./sessionState";

export interface SessionScore {
  correct: number;
  hinted: number;
  wrong: number;
  total: number;
  score: number;
}

export function calculateScore(wordStates: WordState[]): SessionScore {
  const targeted = wordStates.filter(
    ws => !ws.token.isPunct && ws.status !== "revealed"
  );
  const correct = targeted.filter(ws => ws.status === "correct").length;
  const hinted = targeted.filter(ws => ws.status === "hinted").length;
  const wrong = targeted.filter(ws => ws.status === "wrong").length;
  const total = targeted.length;
  const score = total > 0 ? Math.round(((correct + 0.5 * hinted) / total) * 100) : 0;
  return { correct, hinted, wrong, total, score };
}

export type Phase = "P1" | "P2" | "P3";

export interface PhaseHistory {
  phase: Phase;
  score: number;
}

export function evaluateAdvancement(
  currentPhase: Phase,
  history: PhaseHistory[]
): Phase {
  if (currentPhase === "P1") {
    return "P2";
  }
  if (currentPhase === "P2") {
    const recent = history.slice(-2);
    if (
      recent.length >= 2 &&
      recent[0].score >= 85 &&
      recent[1].score >= 85
    ) {
      return "P3";
    }
  }
  return currentPhase;
}
