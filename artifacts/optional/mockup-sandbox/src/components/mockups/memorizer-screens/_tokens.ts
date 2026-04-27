export const T = {
  bg: "#07070A",
  surface: "#111116",
  surface2: "#18181F",
  border: "#27272F",
  primary: "#818CF8",
  primaryDeep: "#4F46E5",
  correct: "#4ADE80",
  wrong: "#F87171",
  hint: "#FB923C",
  text: "#FAFAFA",
  secondary: "#A1A1AA",
  tertiary: "#52525B",
} as const;

export const geist = '"Geist", "Inter", system-ui, sans-serif';
export const lora = '"Lora", Georgia, serif';

export const motion = {
  correctWord: "green pulse + micro-bounce (150ms ease-out)",
  wrongWord: "soft red shake (100ms, no harsh sound)",
  hintUsed: "warm orange glow (200ms ease-in-out)",
  phaseAdvance: "single restrained celebration (not full-screen fireworks)",
  sessionComplete: "score upward reveal (300ms ease-out)",
} as const;

export const DEADLINE_MODES = {
  mnemonic: { maxDays: 3, label: "Mnemonic Mode", color: "#F87171", desc: "AI mnemonic + intensive repetition. No spaced repetition — not enough time." },
  focused: { minDays: 4, maxDays: 7, label: "Focused Review", color: "#FB923C", desc: "Compressed schedule — daily sessions, accelerated phases." },
  spaced: { minDays: 8, label: "Spaced Recall", color: "#4ADE80", desc: "Spaced repetition schedules sessions for peak retention." },
} as const;
