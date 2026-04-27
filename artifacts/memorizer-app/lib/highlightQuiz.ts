export interface QuizQuestion {
  prompt: string;
  answer: string;
  choices: string[];
  answerIndex: number;
}

const STOPLIST_ANSWERS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at",
  "for", "with", "by", "from", "as", "is", "are", "was", "were", "be",
  "been", "being", "am", "has", "have", "had", "do", "does", "did",
  "it", "its", "this", "that", "these", "those", "i", "you", "he",
  "she", "we", "they", "my", "your", "his", "her", "our", "their",
  "so", "if", "then", "than", "not", "no", "yes",
]);

const MIN_QUESTIONS = 4;
const MAX_QUESTIONS = 10;

interface RawWord {
  raw: string;
  clean: string;
}

function tokenize(text: string): RawWord[] {
  const matches = text.match(/\S+/g) ?? [];
  return matches.map((raw) => ({
    raw,
    clean: raw.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, ""),
  })).filter((w) => w.clean.length > 0);
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDistractors(
  answer: string,
  pool: string[],
  rng: () => number,
): string[] {
  const lowerAnswer = answer.toLowerCase();
  const seen = new Set<string>([lowerAnswer]);
  const candidates = pool.filter((w) => {
    const lw = w.toLowerCase();
    if (seen.has(lw)) return false;
    seen.add(lw);
    return true;
  });

  // Prefer candidates of similar length (±3 chars)
  const similar = candidates.filter(
    (w) => Math.abs(w.length - answer.length) <= 3,
  );
  const ordered = similar.length >= 3 ? similar : candidates;

  const shuffled = shuffle(ordered, rng);
  return shuffled.slice(0, 3);
}

export function generateQuiz(text: string, seed?: number): QuizQuestion[] {
  const words = tokenize(text);
  if (words.length < 4) return [];

  const rng = seededRng(seed ?? hashString(text));

  // Build distractor pool: all clean words from the text, deduped (case-insensitive),
  // excluding very short or stoplist words for better-quality distractors.
  const poolSeen = new Set<string>();
  const distractorPool: string[] = [];
  for (const w of words) {
    const lw = w.clean.toLowerCase();
    if (poolSeen.has(lw)) continue;
    if (w.clean.length < 2) continue;
    if (STOPLIST_ANSWERS.has(lw)) continue;
    poolSeen.add(lw);
    distractorPool.push(w.clean);
  }

  // Candidate answer positions: skip first word (no prompt context),
  // skip stoplist words as answers, skip ultra-short words.
  const answerablePositions: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const lw = words[i].clean.toLowerCase();
    if (STOPLIST_ANSWERS.has(lw)) continue;
    if (words[i].clean.length < 2) continue;
    answerablePositions.push(i);
  }

  if (answerablePositions.length === 0) return [];

  // Need at least 3 distractor candidates total
  if (distractorPool.length < 4) return [];

  // Decide how many questions: scale with text length, capped.
  const target = Math.max(
    MIN_QUESTIONS,
    Math.min(MAX_QUESTIONS, Math.floor(words.length / 12)),
  );
  const questionCount = Math.min(target, answerablePositions.length);

  // Spread positions evenly across the text
  const step = answerablePositions.length / questionCount;
  const chosenPositions: number[] = [];
  for (let i = 0; i < questionCount; i++) {
    const idx = Math.min(
      answerablePositions.length - 1,
      Math.floor(i * step + step * 0.5),
    );
    chosenPositions.push(answerablePositions[idx]);
  }

  const questions: QuizQuestion[] = [];
  for (const pos of chosenPositions) {
    const promptStart = Math.max(0, pos - 3);
    const promptWords = words.slice(promptStart, pos).map((w) => w.raw);
    if (promptWords.length === 0) continue;
    const prompt = promptWords.join(" ");
    const answer = words[pos].clean;

    const distractors = pickDistractors(answer, distractorPool, rng);
    if (distractors.length < 3) continue;

    const allChoices = shuffle([answer, ...distractors], rng);
    const answerIndex = allChoices.findIndex(
      (c) => c.toLowerCase() === answer.toLowerCase(),
    );

    questions.push({
      prompt,
      answer,
      choices: allChoices,
      answerIndex,
    });
  }

  return questions;
}
