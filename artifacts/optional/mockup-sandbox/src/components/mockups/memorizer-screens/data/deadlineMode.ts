import type { DeadlineConfig, DeadlineMode } from "./types";

const TOTAL_PHASES = 3;

function fibonacciIntervals(count: number): number[] {
  const seq: number[] = [];
  let a = 1, b = 1;
  for (let i = 0; i < count; i++) {
    seq.push(a);
    [a, b] = [b, a + b];
  }
  return seq;
}

function minsPerSession(wordCount: number): number {
  const wps = 40 / 60;
  const typingSeconds = (wordCount / wps);
  const overhead = 60;
  return Math.max(5, Math.round((typingSeconds + overhead) / 60));
}

export function calcDeadlineMode(
  todayStr: string,
  deadlineDateStr: string,
  wordCount = 50,
): DeadlineConfig {
  const today = new Date(todayStr);
  const deadline = new Date(deadlineDateStr);
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.max(0, Math.round((deadline.getTime() - today.getTime()) / msPerDay));

  let mode: DeadlineMode;
  let modeLabel: string;
  let modeColor: string;
  let modeDesc: string;
  let sessionCount: number;
  let intervals: number[];

  if (daysUntil <= 3) {
    mode = "mnemonic";
    modeLabel = "Mnemonic Mode";
    modeColor = "#F87171";
    modeDesc = "AI mnemonic + intensive repetition. No spaced repetition — not enough time.";
    sessionCount = daysUntil || 1;
    intervals = Array(sessionCount).fill(1);
  } else if (daysUntil <= 7) {
    mode = "focused";
    modeLabel = "Focused Review";
    modeColor = "#FB923C";
    modeDesc = "Compressed schedule — daily sessions, accelerated phases.";
    sessionCount = daysUntil;
    intervals = Array(sessionCount).fill(1);
  } else {
    mode = "spaced";
    modeLabel = "Spaced Recall";
    modeColor = "#4ADE80";
    modeDesc = "Spaced repetition schedules sessions for peak retention.";
    intervals = fibonacciIntervals(TOTAL_PHASES * 3);
    sessionCount = Math.min(daysUntil, intervals.length);
    intervals = intervals.slice(0, sessionCount);
  }

  return {
    deadlineDate: deadlineDateStr,
    mode,
    modeLabel,
    modeColor,
    modeDesc,
    sessionCount,
    minsPerSession: minsPerSession(wordCount),
    daysUntil,
    intervals,
  };
}
