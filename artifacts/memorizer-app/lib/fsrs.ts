import { fsrs, generatorParameters, Rating, State, type Card } from "ts-fsrs";

export { Rating };
export type { Card };

export type FsrsRating = 1 | 2 | 3 | 4;

export const RATING_META: Record<FsrsRating, { label: string; color: string; desc: string }> = {
  1: { label: "Again",  color: "#F87171", desc: "Completely forgot"  },
  2: { label: "Hard",   color: "#FB923C", desc: "Struggled a lot"    },
  3: { label: "Good",   color: "#4ADE80", desc: "Recalled with effort" },
  4: { label: "Easy",   color: "#818CF8", desc: "Recalled perfectly"  },
};

export interface FsrsCardState {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: string;
}

export interface ReviewResult {
  nextDue: string;
  cardState: FsrsCardState;
}

const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));

function toCard(s: FsrsCardState | null, now: Date): Card {
  if (!s || s.state === 0) {
    return {
      due: now,
      stability: 3,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 3,
      reps: 1,
      lapses: 0,
      learning_steps: 0,
      state: State.Review,
    };
  }
  const last = s.lastReview ? new Date(s.lastReview) : now;
  const elapsed = Math.max(0, Math.floor((now.getTime() - last.getTime()) / 86400000));
  return {
    due: now,
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: elapsed,
    scheduled_days: elapsed,
    reps: s.reps,
    lapses: s.lapses,
    learning_steps: 0,
    state: s.state as State,
  };
}

function midnight(d: Date): string {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out.toISOString();
}

export function scheduleFirstReview(now: Date): ReviewResult {
  const card: Card = {
    due: now,
    stability: 3,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 3,
    reps: 1,
    lapses: 0,
    learning_steps: 0,
    state: State.Review,
  };
  const result = scheduler.repeat(card, now);
  const next = result[Rating.Good].card;
  return {
    nextDue: midnight(new Date(next.due)),
    cardState: {
      stability: next.stability,
      difficulty: next.difficulty,
      reps: next.reps,
      lapses: next.lapses,
      state: next.state,
      lastReview: now.toISOString(),
    },
  };
}

export function applyRating(
  rating: FsrsRating,
  existing: FsrsCardState | null,
  now: Date,
): ReviewResult {
  const card = toCard(existing, now);
  const result = scheduler.repeat(card, now);
  const ratingMap = {
    1: result[Rating.Again],
    2: result[Rating.Hard],
    3: result[Rating.Good],
    4: result[Rating.Easy],
  } as const;
  const next = ratingMap[rating].card;
  return {
    nextDue: midnight(new Date(next.due)),
    cardState: {
      stability: next.stability,
      difficulty: next.difficulty,
      reps: next.reps,
      lapses: next.lapses,
      state: next.state,
      lastReview: now.toISOString(),
    },
  };
}
