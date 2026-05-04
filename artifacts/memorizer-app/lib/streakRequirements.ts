/**
 * Consecutive passing sessions needed to advance past each phase at that phase's score threshold.
 * Keep in sync with session commit logic in practice.tsx and chunk updates in AppContext.tsx.
 */
export const STREAK_REQUIRED_BY_PHASE: Record<number, number> = {
  1: 1,
  2: 3,
  3: 3,
};

export function streakRequiredForPhase(phase: number): number {
  return STREAK_REQUIRED_BY_PHASE[phase] ?? 2;
}
