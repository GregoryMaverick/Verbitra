import type { DeadlineConfig, Session } from "./types";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function calcNextSessionDate(
  sessions: Session[],
  deadline: DeadlineConfig,
  now = new Date().toISOString(),
): string {
  if (sessions.length === 0) {
    return now;
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
  const lastSession = sorted[0];
  const sessionIndex = sessions.length - 1;
  const { intervals, mode } = deadline;

  let intervalDays: number;

  if (mode === "mnemonic") {
    intervalDays = 1;
  } else if (mode === "focused") {
    intervalDays = 1;
  } else {
    const fibSeq = intervals;
    intervalDays = fibSeq[sessionIndex] ?? fibSeq[fibSeq.length - 1] ?? 1;
  }

  const nextDate = addDays(lastSession.completedAt, intervalDays);
  const nowMs = new Date(now).getTime();
  const nextMs = new Date(nextDate).getTime();

  if (nextMs <= nowMs) {
    return now;
  }

  return nextDate;
}

export function formatNextSessionLabel(nextDateStr: string, now = new Date()): { label: string; time: string } {
  const next = new Date(nextDateStr);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date(next);
  nextDay.setHours(0, 0, 0, 0);

  const timeStr = next.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (nextDay.getTime() === today.getTime()) {
    return { label: "Today", time: timeStr };
  } else if (nextDay.getTime() === tomorrow.getTime()) {
    return { label: "Tomorrow", time: timeStr };
  } else {
    const dateStr = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label: dateStr, time: timeStr };
  }
}
