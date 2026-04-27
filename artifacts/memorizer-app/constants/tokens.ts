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

export const fontFamilies = {
  geist: "Inter_400Regular",
  geistMedium: "Inter_500Medium",
  geistSemiBold: "Inter_600SemiBold",
  geistBold: "Inter_700Bold",
  lora: "Lora_400Regular",
  loraBold: "Lora_700Bold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
} as const;

export const motion = {
  correctWord: { duration: 150, easing: "ease-out" },
  wrongWord: { duration: 100 },
  hintUsed: { duration: 200, easing: "ease-in-out" },
  phaseAdvance: { duration: 300, easing: "ease-out" },
  sessionComplete: { duration: 300, easing: "ease-out" },
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  primary: {
    shadowColor: "#818CF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const DEADLINE_MODES = {
  mnemonic: {
    maxDays: 3,
    label: "Mnemonic Mode",
    color: "#F87171",
    desc: "AI mnemonic + intensive repetition. No spaced repetition — not enough time.",
  },
  focused: {
    minDays: 4,
    maxDays: 7,
    label: "Focused Review",
    color: "#FB923C",
    desc: "Compressed schedule — daily sessions, accelerated phases.",
  },
  spaced: {
    minDays: 8,
    label: "Spaced Recall",
    color: "#4ADE80",
    desc: "Spaced repetition schedules sessions for peak retention.",
  },
} as const;
