import type { TextEntry } from "@/context/AppContext";

export interface NextSessionInfo {
  label: string;
  sub: string;
  isToday: boolean;
}

/**
 * Compute the next-session label/sub for a text. Used by both the home card
 * and the results screen so they stay in sync.
 *
 * @param text The text entry
 * @param sessionsToday Number of sessions completed today for this text
 * @param justFinishedSession If true, we just finished a session (so "Next" should look forward)
 */
export function getNextSessionInfo(
  text: Pick<TextEntry, "mode" | "phase" | "totalPhases" | "nextSessionTime" | "isTightDeadline">,
  sessionsToday: number,
  justFinishedSession: boolean = false,
): NextSessionInfo {
  const isMastered = text.phase > text.totalPhases;
  if (isMastered) {
    return { label: "Review due", sub: "spaced", isToday: false };
  }

  // Tight deadlines (≤2 days) follow a fixed 5-session ladder.
  if (text.isTightDeadline) {
    const cap = 5;
    const labelFor = (n: number) => `Session ${n} of ${cap}`;
    if (justFinishedSession) {
      if (sessionsToday < cap) {
        return { label: "Today", sub: labelFor(sessionsToday + 1), isToday: true };
      }
      return { label: "Tomorrow", sub: text.nextSessionTime || "", isToday: false };
    }
    if (sessionsToday < cap) {
      return { label: "Today", sub: labelFor(sessionsToday + 1), isToday: true };
    }
    return { label: "Tomorrow", sub: text.nextSessionTime || "", isToday: false };
  }

  // Intensive mode = 2 sessions per day. After session 1, session 2 is "today".
  if (text.mode === "intensive") {
    if (justFinishedSession) {
      if (sessionsToday < 2) {
        return { label: "Today", sub: "Session 2 of 2", isToday: true };
      }
      return { label: "Tomorrow", sub: "Session 1 of 2", isToday: false };
    }
    if (sessionsToday === 0) {
      return { label: "Today", sub: "Session 1 of 2", isToday: true };
    }
    if (sessionsToday === 1) {
      return { label: "Today", sub: "Session 2 of 2", isToday: true };
    }
    return { label: "Tomorrow", sub: "Session 1 of 2", isToday: false };
  }

  // Mnemonic mode (3-day deadline) = 3 sessions per day to fit verbatim
  // memorization into a tight window without crossing into the 5-session
  // tight-deadline ladder.
  if (text.mode === "mnemonic") {
    const cap = 3;
    const labelFor = (n: number) => `Session ${n} of ${cap}`;
    if (justFinishedSession) {
      if (sessionsToday < cap) {
        return { label: "Today", sub: labelFor(sessionsToday + 1), isToday: true };
      }
      return { label: "Tomorrow", sub: labelFor(1), isToday: false };
    }
    if (sessionsToday < cap) {
      return { label: "Today", sub: labelFor(sessionsToday + 1), isToday: true };
    }
    return { label: "Tomorrow", sub: labelFor(1), isToday: false };
  }

  // Standard / spaced: one session per day.
  if (sessionsToday > 0) {
    return { label: "Tomorrow", sub: text.nextSessionTime || "", isToday: false };
  }
  return { label: "Today", sub: text.nextSessionTime || "", isToday: true };
}
