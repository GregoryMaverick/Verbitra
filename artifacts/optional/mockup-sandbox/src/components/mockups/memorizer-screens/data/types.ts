export type DeadlineMode = "mnemonic" | "focused" | "spaced";

export interface DeadlineConfig {
  deadlineDate: string;
  mode: DeadlineMode;
  modeLabel: string;
  modeColor: string;
  modeDesc: string;
  sessionCount: number;
  minsPerSession: number;
  daysUntil: number;
  intervals: number[];
}

export interface Session {
  id: string;
  textId: string;
  completedAt: string;
  score: number;
  correct: number;
  total: number;
  hintsUsed: number;
  phase: number;
}

export interface VerbitraText {
  id: string;
  content: string;
  wordCount: number;
  createdAt: string;
  deadlineConfig: DeadlineConfig | null;
  currentPhase: number;
  totalPhases: number;
  sessionHistory: Session[];
  nextSessionDate: string | null;
  lastRecallPct: number | null;
}

export interface Progress {
  textId: string;
  phase: number;
  sessionCount: number;
  lastScore: number;
  nextSessionDate: string;
}
