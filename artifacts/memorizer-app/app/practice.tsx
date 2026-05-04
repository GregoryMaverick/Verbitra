import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { streakRequiredForPhase } from "@/lib/streakRequirements";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { fetchAcronym, fetchMnemonic, triggerAcronymGeneration, type MnemonicResponse } from "@/lib/api";
import { isMnemonicSuitable } from "@/lib/contentClassifier";
import { MnemonicScaffoldCard } from "@/components/MnemonicScaffoldCard";
import { useSubscription } from "@/lib/revenuecat";
import PaywallModal from "@/components/PaywallModal";
import { useHardAuthGate } from "@/hooks/useHardAuthGate";
import { generateQuiz, type QuizQuestion } from "@/lib/highlightQuiz";

const GATE1_SESSION_THRESHOLD = 7;

function makeSessionId(): string {
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${(0x8 | (Math.random() * 4)).toString(16)}${hex().slice(1)}-${hex()}${hex()}${hex()}`;
}

type WordStatus = "correct" | "blank" | "hint" | "punct" | "wrong";
type SubmitResult = "correct" | "partial" | "wrong";
type ActivityType = "guided-typing" | "first-letter" | "progressive-deletion" | "typing-memory" | "rapid-fire" | "acronym-builder" | "next-word-quiz";

interface WordToken {
  w: string;
  status: WordStatus;
  index: number;
}

const DEMO_TEXT =
  "You have the right to remain silent. Anything you say can and will be used against you in a court of law.";

const FUNCTION_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","are","was","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might","shall",
  "can","not","no","nor","so","yet","this","that","these","those","it","its",
  "you","your","we","our","they","their","he","she","his","her","i","me","us",
  "him","them","who","which","if","then","than","too","also","just","very",
  "all","any","some","each","both","either","neither","same","such",
]);

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
    for (let j = 1; j <= n; j++) {
      dp[i][j] = i === 0
        ? j
        : a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function tokenizeForPhase(content: string, phase: number): WordToken[] {
  const parts = content.match(/[A-Za-z'']+|[^A-Za-z\s]+/g) ?? [];
  const tokens: WordToken[] = [];
  let idx = 0;
  for (const part of parts) {
    if (!/[A-Za-z]/.test(part)) {
      tokens.push({ w: part, status: "punct", index: idx++ });
    } else {
      const lower = part.toLowerCase();
      let status: WordStatus;
      if (phase >= 3) {
        status = "blank";
      } else {
        status = FUNCTION_WORDS.has(lower) ? "correct" : "blank";
      }
      tokens.push({ w: part, status, index: idx++ });
    }
  }
  return tokens;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getSubmitResult(typed: string, target: string): SubmitResult {
  const a = normalize(typed);
  const b = normalize(target);
  if (a === b) return "correct";
  const dist = levenshtein(a, b);
  return dist <= 2 ? "partial" : "wrong";
}

// Tight deadlines (≤2 days) follow a fixed 5-session ladder. Session 1 is the
// Phase 1 Read & Listen (handled by /reading). Sessions 2-5 are the practice
// activities below. On failure we hold the user on the same activity until they
// score the threshold (matches the "Next session: same activity … keep going"
// advisory shown on the results screen).
const TIGHT_PRACTICE_LADDER: ActivityType[] = [
  "progressive-deletion", // session 2 — Phase 1 PD
  "next-word-quiz",       // session 3 — Phase 2 streak 0
  "first-letter",         // session 4 — Phase 2 streak 1
  "typing-memory",        // session 5 — Phase 3 Recall
];
const TIGHT_PASS_THRESHOLD = 80;

function getTightActivity(passingPracticeSessions: number): ActivityType {
  // We index by passing practice sessions only — failures don't advance the ladder.
  return TIGHT_PRACTICE_LADDER[Math.min(passingPracticeSessions, TIGHT_PRACTICE_LADDER.length - 1)];
}

function getActivityType(phase: number, sessionCount: number, consecutiveGoodSessions: number, contentType?: string, mnemonicAlreadyShown?: boolean): ActivityType {
  // Use consecutive-good-sessions (a streak that resets on failure) so users who fail
  // an activity stay on it instead of being pushed forward to harder ones.
  const progress = consecutiveGoodSessions;
  if (phase <= 1) {
    // Phase 1: session 1 = Read & Listen (handled by /reading), session 2+ = Progressive deletion
    return "progressive-deletion";
  }
  if (phase >= 3) {
    if (progress >= 1) return "rapid-fire";
    return "typing-memory";
  }
  // Phase 2 ladder
  if (contentType === "ordered-list") {
    // Ordered lists keep the acronym tip at streak 0 (memory aid first), then
    // step through first-letter and guided-typing.
    if (progress === 0) return "acronym-builder";
    if (progress === 1) return "first-letter";
    return "guided-typing";
  }
  if (progress === 0) return "next-word-quiz";
  if (progress === 1) return "first-letter";
  return "guided-typing";
}

const ACTIVITY_META: Record<ActivityType, { name: string; desc: string; color: string }> = {
  "guided-typing":        { name: "Guided Typing",        desc: "Function words shown · fill in the rest",          color: T.hint },
  "first-letter":         { name: "First Letter Recall",  desc: "Use the first letter as a cue · type the rest",    color: T.primary },
  "progressive-deletion": { name: "Progressive Deletion", desc: "Type the missing word in the box & press Return to start · then a new word disappears every 7s",  color: T.hint },
  "typing-memory":        { name: "Typing from Memory",   desc: "All words hidden · recall the full text",          color: T.correct },
  "rapid-fire":           { name: "Rapid Fire",           desc: "One sentence at a time · no going back",           color: T.wrong },
  "acronym-builder":      { name: "Acronym Tip",          desc: "AI-generated acronym to anchor the list in memory", color: T.primary },
  "next-word-quiz":       { name: "Next-Word Quiz",       desc: "Pick what comes next · 4-choice multiple choice",   color: T.primary },
};

function getPhaseMeta(phase: number): { label: string; color: string } {
  if (phase >= 4) return { label: "Mastered · Review", color: T.correct };
  if (phase === 3) return { label: "P3 · Recall", color: T.correct };
  if (phase <= 1) return { label: "P1 · Practice", color: T.primary };
  return { label: "P2 · Guided Typing", color: T.hint };
}

function getSentenceRanges(tokens: WordToken[]): Array<[number, number]> {
  if (tokens.length === 0) return [[0, 0]];
  const ranges: Array<[number, number]> = [];
  let sentenceStart = 0;
  for (const token of tokens) {
    if (token.status === "punct" && /[.!?]/.test(token.w)) {
      ranges.push([sentenceStart, token.index]);
      sentenceStart = token.index + 1;
    }
  }
  const lastToken = tokens[tokens.length - 1];
  if (sentenceStart <= lastToken.index) {
    ranges.push([sentenceStart, lastToken.index]);
  }
  return ranges.length > 0 ? ranges : [[0, lastToken.index]];
}

const PHASE_THRESHOLD: Record<number, number> = { 1: 60, 2: 80, 3: 95 };

// Hint chip is offered while the user is still ramping up; once they've hit a
// streak that proves they can recall unaided we hide the chip and surface a
// one-time toast so they know it's intentional, not a bug.
function isHintChipEligible(phase: number, consecutiveGoodSessions: number, activityType?: ActivityType, isTightDeadline?: boolean): boolean {
  // In tight-deadline mode, typing-memory can appear on the ladder while phase
  // is still 2. Offer the chip there regardless of streak (first full recall).
  // Once phase is 3, use the same streak-0 rule as non-tight mode so "peek"
  // does not return after the graduation message (streak ≥ 1).
  if (isTightDeadline && activityType === "typing-memory" && phase <= 2) return true;
  if (phase <= 2) return consecutiveGoodSessions <= 1;
  if (phase === 3) return consecutiveGoodSessions === 0;
  return false;
}
function isHintGraduationStreak(phase: number, consecutiveGoodSessions: number): boolean {
  // Fire only when hints are *permanently* gone — i.e. once the user reaches
  // Phase 3 streak 1 (rapid-fire), where the hint chip never returns. Earlier
  // milestones still let hints come back next session, so the toast there
  // would be misleading.
  if (phase === 3 && consecutiveGoodSessions >= 1) return true;
  return false;
}
const HINT_GRAD_STORAGE_KEY = "@verbitra:hint_graduation_shown_v1";

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ textId?: string; textTitle?: string; isReview?: string; isFlash?: string; chunkIndex?: string; isFullRun?: string }>();
  const isReview = params.isReview === "true";
  const isFlash = params.isFlash === "true";
  const isFullRun = params.isFullRun === "true";
  const chunkIndexParam = params.chunkIndex != null ? Number(params.chunkIndex) : null;
  const { recordSession, recordChunkSession, updateText, advancePhase, markAsMastered, texts, sessions } = useApp();
  const { getValidToken } = useAuth();
  useHardAuthGate();
  const { isSubscribed } = useSubscription();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const gate1Locked = !isSubscribed && sessions.length >= GATE1_SESSION_THRESHOLD;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const entry = useMemo(() => {
    const tid = params.textId;
    if (!tid || tid === "demo") return null;
    return texts.find((t) => t.id === tid) ?? null;
  }, [params.textId, texts]);

  const activeChunk = useMemo(() => {
    if (isFullRun || chunkIndexParam == null || !entry?.chunks) return null;
    return entry.chunks.find((c) => c.index === chunkIndexParam) ?? null;
  }, [entry, chunkIndexParam, isFullRun]);

  const actualPhase = isFullRun ? 3 : (activeChunk ? activeChunk.phase : (entry ? entry.phase : 2));
  const sessionCountInPhase = activeChunk ? activeChunk.sessionCountInPhase : (entry?.sessionCountInPhase ?? 0);
  const consecutiveGoodSessions = activeChunk ? activeChunk.consecutiveGoodSessions : (entry?.consecutiveGoodSessions ?? 0);
  const contentType = entry?.contentType ?? "passage";
  const mnemonicAlreadyShown = isMnemonicSuitable(contentType) && (entry?.daysLeft ?? 99) <= 3;
  const tightPassingPracticeSessions = useMemo(() => {
    // Sessions that pass the threshold AND happened in the practice loop
    // (phase >= 2). Phase 1 reading is the implicit Session 1 of the ladder
    // and is not counted as a "practice session".
    if (!entry) return 0;
    return sessions.filter(
      (s) =>
        s.textId === entry.id &&
        s.chunkIndex == null &&
        s.phase >= 2 &&
        s.score >= TIGHT_PASS_THRESHOLD,
    ).length;
  }, [sessions, entry]);
  const rawActivityType = entry?.isTightDeadline
    ? getTightActivity(tightPassingPracticeSessions)
    : getActivityType(actualPhase, sessionCountInPhase, consecutiveGoodSessions, contentType, mnemonicAlreadyShown);
  const phaseMeta = getPhaseMeta(actualPhase);

  useEffect(() => {
    if (!isFullRun && activeChunk && !activeChunk.isUnlocked) {
      router.replace({ pathname: "/(tabs)" });
    } else if (!isFullRun && activeChunk && activeChunk.phase === 1 && activeChunk.sessionCountInPhase === 0) {
      // Phase 1 session 1 = Read & Listen; subsequent Phase 1 sessions are PD in /practice.
      router.replace({
        pathname: "/reading",
        params: { textId: entry!.id, textTitle: entry!.title, chunkIndex: String(chunkIndexParam) },
      });
    } else if (!isFullRun && !activeChunk && entry && entry.phase === 1 && (entry.sessionCountInPhase ?? 0) === 0) {
      router.replace({
        pathname: "/reading",
        params: { textId: entry.id, textTitle: entry.title },
      });
    }
  }, [entry?.id, entry?.phase, entry?.sessionCountInPhase, activeChunk?.phase, activeChunk?.sessionCountInPhase, activeChunk?.isUnlocked, isFullRun]);

  const practiceContent = activeChunk
    ? activeChunk.content
    : isFullRun && entry?.chunks && entry.chunks.length > 0
    ? entry.chunks.map((c) => c.content).join(" ")
    : (entry?.content ?? DEMO_TEXT);

  // Detect single-sentence texts: rapid-fire (one sentence at a time) makes no sense for them
  const isSingleSentenceText = practiceContent.trim().split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 2).length <= 1;
  const activityType: ActivityType = (() => {
    const base: ActivityType = isReview ? "typing-memory" : isFlash ? "rapid-fire" : rawActivityType;
    // Rapid-fire serves one sentence at a time, which is meaningless on a
    // single-sentence text. Fall back to typing-memory (recall the whole
    // text from blank) — that's the same exercise rapid-fire would be on a
    // single sentence, and it's phase-appropriate. PD is a beginner activity
    // and felt out of place in Phase 3.
    if (base === "rapid-fire" && isSingleSentenceText) return "typing-memory";
    return base;
  })();
  const activityMeta = ACTIVITY_META[activityType];

  const allTokens = useMemo(() => {
    if (!entry) return tokenizeForPhase(DEMO_TEXT, 2);
    return tokenizeForPhase(practiceContent, actualPhase);
  }, [entry, practiceContent, actualPhase]);

  const sentenceRanges = useMemo((): Array<[number, number]> => {
    if (activityType !== "rapid-fire") return [];
    return getSentenceRanges(allTokens);
  }, [activityType, allTokens]);

  const pdContentIndices = useMemo(() => {
    if (activityType !== "progressive-deletion") return [];
    return allTokens.filter((t) => t.status === "blank").map((t) => t.index);
  }, [activityType, allTokens]);

  const [typedWords, setTypedWords] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, SubmitResult>>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealedChars, setRevealedChars] = useState<Record<number, number>>({});
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const inputRefs = useRef<Record<number, TextInput | null>>({});

  const [pdBlankedIndices, setPdBlankedIndices] = useState<number[]>([]);
  const pdQueueRef = useRef<number[]>([]);
  const pdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rfSentenceIdx, setRfSentenceIdx] = useState(0);
  const [flashTimeLeft, setFlashTimeLeft] = useState(120);
  const flashTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [abTip, setAbTip] = useState<{ acronym: string; explanation: string } | null>(null);
  const [abTipStatus, setAbTipStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [mnemonic, setMnemonic] = useState<MnemonicResponse | null>(null);

  // Next-word quiz state
  const [qIdx, setQIdx] = useState(0);
  const [qSelected, setQSelected] = useState<number | null>(null);
  const [qResults, setQResults] = useState<boolean[]>([]);

  // Hint graduation toast (one-time, AsyncStorage gated)
  const [gradToast, setGradToast] = useState<string | null>(null);
  // Hide the practice UI immediately when finishing so the user doesn't see a
  // flash of the next activity (because state advances before /results mounts).
  const [finishing, setFinishing] = useState(false);
  const gradToastAnim = useRef(new Animated.Value(0)).current;

  // Fetch Gemini-generated acronym tip when in acronym-builder mode
  useEffect(() => {
    if (gate1Locked) return;
    if (activityType !== "acronym-builder" || !entry?.id || entry.id === "demo") return;
    setAbTip(null);
    setAbTipStatus("loading");
    const textId = entry.id;
    const content = practiceContent;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    let token: string | null = null;

    function poll() {
      if (cancelled) return;
      fetchAcronym(textId, token).then((res) => {
        if (cancelled) return;
        if (res.status === "ready") {
          setAbTip({ acronym: res.acronym, explanation: res.explanation });
          setAbTipStatus("ready");
        } else if (res.status === "error") {
          setAbTipStatus("error");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2500);
        } else {
          setAbTipStatus("error");
        }
      }).catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        // Stop immediately on auth errors — retrying won't help
        if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          setAbTipStatus("error");
          return;
        }
        triggerAcronymGeneration(textId, content, token).catch(() => {});
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 3000);
        } else {
          setAbTipStatus("error");
        }
      });
    }

    getValidToken().then((t) => {
      if (cancelled) return;
      token = t;
      if (!token) { setAbTipStatus("error"); return; }
      poll();
    }).catch(() => { setAbTipStatus("error"); });
    return () => { cancelled = true; };
  }, [activityType, entry?.id, practiceContent, gate1Locked]);

  // Fetch mnemonic scaffold (phases 2–3 only, mnemonic-suitable content types)
  useEffect(() => {
    if (gate1Locked) return;
    const tid = entry?.id;
    if (!tid || tid === "demo") return;
    if (actualPhase > 3) return;
    if (!isMnemonicSuitable(contentType)) return;
    let cancelled = false;
    getValidToken()
      .then((token) => fetchMnemonic(tid, token))
      .catch(() => fetchMnemonic(tid, null))
      .then((res) => { if (!cancelled && res.status === "ready") setMnemonic(res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [entry?.id, actualPhase, contentType, gate1Locked]);

  // Flash mode 2-minute countdown
  useEffect(() => {
    if (!isFlash) return;
    if (flashTimerRef.current) clearInterval(flashTimerRef.current);
    setFlashTimeLeft(120);
    flashTimerRef.current = setInterval(() => {
      setFlashTimeLeft((t) => {
        if (t <= 1) {
          if (flashTimerRef.current) {
            clearInterval(flashTimerRef.current);
            flashTimerRef.current = null;
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (flashTimerRef.current) {
        clearInterval(flashTimerRef.current);
        flashTimerRef.current = null;
      }
    };
  }, [isFlash]);

  // Reset session state when the entry or activity changes (prevents stale carry-over)
  const entryId = entry?.id;
  useEffect(() => {
    setPdBlankedIndices([]);
    setRfSentenceIdx(0);
    setTypedWords({});

    // For dialogue texts with a character name, auto-correct all non-character-line tokens
    const autoCorrect: Record<number, SubmitResult> = {};
    if (contentType === "dialogue" && entry?.myCharacterName) {
      const charName = entry.myCharacterName.trim().toUpperCase();
      if (charName) {
        const lines = practiceContent.split("\n");
        let tokenIdx = 0;
        for (const line of lines) {
          const parts: string[] = line.match(/[A-Za-z'']+|[^A-Za-z\s]+/g) ?? [];
          const colonIdx = line.indexOf(":");
          const nameBeforeColon = colonIdx >= 0
            ? line.slice(0, colonIdx).trim().replace(/\s+/g, " ").toUpperCase()
            : "";
          const isCharLine = charName.length > 0 && nameBeforeColon === charName;
          if (!isCharLine) {
            for (const p of parts) {
              if (/[A-Za-z]/.test(p)) {
                const lower = p.toLowerCase();
                if (actualPhase >= 3 || !FUNCTION_WORDS.has(lower)) {
                  autoCorrect[tokenIdx] = "correct";
                }
              }
              tokenIdx++;
            }
          } else {
            tokenIdx += parts.length;
          }
        }
      }
    }

    setSubmitted(autoCorrect);
    setActiveIndex(null);
    setRevealedChars({});
    setHintUsed({});
    setQIdx(0);
    setQSelected(null);
    setQResults([]);

    if (activityType === "first-letter") {
      const initial: Record<number, string> = {};
      for (const token of allTokens) {
        if (token.status === "blank" && token.w.length > 0) {
          initial[token.index] = token.w[0];
        }
      }
      setTypedWords(initial);
    }
  }, [entryId, activityType, contentType, entry?.myCharacterName, practiceContent, actualPhase]);

  const quizQuestions = useMemo<QuizQuestion[]>(() => {
    if (activityType !== "next-word-quiz") return [];
    try {
      const seed = (entry?.id ?? "demo").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      return generateQuiz(practiceContent, seed);
    } catch {
      return [];
    }
  }, [activityType, practiceContent, entry?.id]);

  const pdContentKey = pdContentIndices.join(",");
  // First-word timer suppression: the very first blanked word has no countdown
  // pressure so the user can settle in. After they submit it, the 7s interval
  // kicks in for subsequent words.
  const pdFirstWordSubmittedRef = useRef(false);
  useEffect(() => {
    if (activityType !== "progressive-deletion") return;
    pdQueueRef.current = [...pdContentIndices];
    pdFirstWordSubmittedRef.current = false;
    // Reveal the first blank immediately (no initial delay, no timer).
    const firstIndex = pdQueueRef.current.shift();
    if (firstIndex !== undefined) {
      setPdBlankedIndices([firstIndex]);
      Vibration.vibrate(20);
      setTimeout(() => {
        inputRefs.current[firstIndex]?.focus();
        setActiveIndex(firstIndex);
      }, 200);
    }
    return () => {
      if (pdTimerRef.current) clearInterval(pdTimerRef.current);
      pdTimerRef.current = null;
    };
  }, [activityType, pdContentKey]);

  const pdStartIntervalIfNeeded = useCallback(() => {
    if (activityType !== "progressive-deletion") return;
    if (pdTimerRef.current) return;
    if (pdQueueRef.current.length === 0) return;
    pdTimerRef.current = setInterval(() => {
      const nextIndex = pdQueueRef.current.shift();
      if (nextIndex === undefined) {
        if (pdTimerRef.current) clearInterval(pdTimerRef.current);
        pdTimerRef.current = null;
        return;
      }
      setPdBlankedIndices((prev) => [...prev, nextIndex]);
      Vibration.vibrate(20);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
        setActiveIndex(nextIndex);
      }, 150);
    }, 7000);
  }, [activityType]);

  const visibleTokens = useMemo(() => {
    if (activityType !== "rapid-fire" || sentenceRanges.length === 0) return allTokens;
    const safeIdx = Math.min(rfSentenceIdx, sentenceRanges.length - 1);
    const [start, end] = sentenceRanges[safeIdx];
    return allTokens.filter((t) => t.index >= start && t.index <= end);
  }, [activityType, allTokens, sentenceRanges, rfSentenceIdx]);

  const typeableTokens = useMemo(() => {
    if (activityType === "progressive-deletion") {
      const blankedSet = new Set(pdBlankedIndices);
      return allTokens.filter((t) => blankedSet.has(t.index));
    }
    return allTokens.filter((t) => t.status === "blank" || t.status === "hint");
  }, [activityType, allTokens, pdBlankedIndices]);

  const blankIndices = useMemo(() => typeableTokens.map((t) => t.index), [typeableTokens]);
  const totalTypeable = typeableTokens.length;

  const handleHint = useCallback((index: number) => {
    if (activityType === "progressive-deletion") return;
    // Long-press hints follow the same eligibility as the hint chip — once the
    // user graduates from training wheels, no hint mechanism remains.
    if (!isHintChipEligible(actualPhase, consecutiveGoodSessions, activityType, entry?.isTightDeadline)) return;
    const token = allTokens.find((t) => t.index === index);
    if (!token || submitted[index]) return;
    const current = revealedChars[index] ?? 0;
    if (current >= token.w.length) return;
    Vibration.vibrate(30);
    setRevealedChars((prev) => ({ ...prev, [index]: current + 1 }));
    setHintUsed((prev) => ({ ...prev, [index]: true }));
    setTypedWords((prev) => ({ ...prev, [index]: token.w.substring(0, current + 1) }));
  }, [allTokens, revealedChars, submitted, activityType, actualPhase, consecutiveGoodSessions, entry?.isTightDeadline]);

  // Hint chip = full-word peek for the active blank. Eligibility ramps off as the
  // user gains streaks; once they graduate we hide the chip and show a one-time
  // toast so they understand it's intentional.
  const hintChipEligible = isHintChipEligible(actualPhase, consecutiveGoodSessions, activityType, entry?.isTightDeadline);
  const hintFlashTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const handleHintChip = useCallback(() => {
    if (activityType === "progressive-deletion") return;
    if (activityType === "rapid-fire") return;
    if (activityType === "acronym-builder" || activityType === "next-word-quiz") return;
    if (activeIndex == null) return;
    const idx = activeIndex;
    const token = allTokens.find((t) => t.index === idx);
    if (!token || submitted[idx]) return;
    Vibration.vibrate(20);
    setHintUsed((prev) => ({ ...prev, [idx]: true }));
    setTypedWords((prev) => ({ ...prev, [idx]: token.w }));
    setRevealedChars((prev) => ({ ...prev, [idx]: token.w.length }));
    if (hintFlashTimers.current[idx]) clearTimeout(hintFlashTimers.current[idx]);
    hintFlashTimers.current[idx] = setTimeout(() => {
      setTypedWords((prev) => {
        if (submitted[idx]) return prev;
        const next = { ...prev };
        next[idx] = "";
        return next;
      });
      setRevealedChars((prev) => ({ ...prev, [idx]: 0 }));
      inputRefs.current[idx]?.focus();
    }, 1500);
  }, [activeIndex, allTokens, submitted, activityType]);
  useEffect(() => () => {
    Object.values(hintFlashTimers.current).forEach((t) => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!gradToast) return;
    Animated.timing(gradToastAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const dismiss = setTimeout(() => {
      Animated.timing(gradToastAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setGradToast(null));
    }, 3500);
    return () => clearTimeout(dismiss);
  }, [gradToast, gradToastAnim]);

  const titleText = params.textTitle ?? "Miranda Rights";

  const handleChange = useCallback((index: number, text: string) => {
    // All typing activities: fields are locked once submitted — ignore any change events.
    if (submitted[index]) return;

    let sanitized = text;
    if (activityType === "first-letter") {
      const token = allTokens.find((t) => t.index === index);
      if (token && token.w.length > 0) {
        const first = token.w[0];
        if (text.length === 0) {
          sanitized = first;
        } else if (text[0] !== first) {
          sanitized = first + text;
        }
      }
    }
    setTypedWords((prev) => ({ ...prev, [index]: sanitized }));
    setSubmitted((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, [activityType, allTokens, submitted]);

  const handleSubmit = useCallback((index: number) => {
    const token = allTokens.find((t) => t.index === index);
    if (!token) return;
    const typed = (typedWords[index] ?? "").trim();
    if (!typed) return;
    const result = getSubmitResult(typed, token.w);

    // Also submit all previous blanks that have content but are ungraded.
    // This catches words the user filled in and skipped past without pressing Next.
    const patch: Record<number, SubmitResult> = {};
    for (const bi of blankIndices) {
      if (bi >= index) break;
      if (!submitted[bi]) {
        const prevToken = allTokens.find((t) => t.index === bi);
        const prevTyped = (typedWords[bi] ?? "").trim();
        if (prevToken && prevTyped) {
          patch[bi] = getSubmitResult(prevTyped, prevToken.w);
        }
      }
    }
    patch[index] = result;
    setSubmitted((prev) => ({ ...prev, ...patch }));

    // All typing activities: always advance after submit — score is locked on first attempt.
    // Blur immediately so the field can't receive further input before re-render.
    inputRefs.current[index]?.blur();
    const alreadySubmitted = { ...submitted, ...patch };
    const nextBlank = blankIndices.find((bi) => bi > index && !alreadySubmitted[bi]);
    if (nextBlank != null) {
      setActiveIndex(nextBlank);
      setTimeout(() => inputRefs.current[nextBlank]?.focus(), 80);
    }

    // Progressive-deletion: the first blanked word has no countdown. Once the user
    // submits it, kick off the 7-second interval for subsequent words.
    if (activityType === "progressive-deletion" && !pdFirstWordSubmittedRef.current) {
      pdFirstWordSubmittedRef.current = true;
      pdStartIntervalIfNeeded();
    }
  }, [allTokens, typedWords, submitted, blankIndices, activityType, pdStartIntervalIfNeeded]);

  const correctCount = typeableTokens.filter((t) => submitted[t.index] === "correct").length;
  const partialCount = typeableTokens.filter((t) => submitted[t.index] === "partial").length;
  const hintsUsedCount = typeableTokens.filter((t) => hintUsed[t.index]).length;

  // Hint-used words score at half value regardless of typed accuracy.
  const wordCredit = useCallback(
    (tokenIndex: number, status: SubmitResult | undefined): number => {
      if (status !== "correct" && status !== "partial") return 0;
      if (hintUsed[tokenIndex]) return 0.5;
      return status === "correct" ? 1.0 : 0.8;
    },
    [hintUsed]
  );

  // Per-sentence counts for rapid fire score display
  const rfSentenceTypeable = useMemo(() => {
    if (activityType !== "rapid-fire" || sentenceRanges.length === 0) return typeableTokens;
    const [start, end] = sentenceRanges[Math.min(rfSentenceIdx, sentenceRanges.length - 1)];
    return typeableTokens.filter((t) => t.index >= start && t.index <= end);
  }, [activityType, typeableTokens, sentenceRanges, rfSentenceIdx]);
  const rfSentenceCorrect = rfSentenceTypeable.filter((t) => submitted[t.index] === "correct").length;
  const rfSentenceTotal = rfSentenceTypeable.length;

  const displayCorrect = activityType === "rapid-fire" ? rfSentenceCorrect : correctCount;
  const displayTotal = activityType === "rapid-fire" ? rfSentenceTotal : totalTypeable;

  const creditSum = typeableTokens.reduce((sum, t) => sum + wordCredit(t.index, submitted[t.index]), 0);
  const score = totalTypeable === 0 ? 0 : Math.round((creditSum / totalTypeable) * 100);
  const progress = totalTypeable === 0 ? 0 : creditSum / totalTypeable;

  const computeFinalScore = useCallback(() => {
    const finalSubmitted = { ...submitted };
    for (const token of typeableTokens) {
      if (!finalSubmitted[token.index]) {
        const typed = (typedWords[token.index] ?? "").trim();
        if (typed) {
          finalSubmitted[token.index] = getSubmitResult(typed, token.w);
        }
      }
    }
    setSubmitted(finalSubmitted);

    const finalHints = typeableTokens.filter((t) => hintUsed[t.index]).length;
    const missedWords = typeableTokens
      .filter((t) => finalSubmitted[t.index] !== "correct" && finalSubmitted[t.index] !== "partial")
      .map((t) => t.w)
      .join("|");

    let finalScore: number;
    let finalCorrect: number;
    let finalPartial: number;

    if (activityType === "rapid-fire" && sentenceRanges.length > 0) {
      // Sentence-averaged scoring: compute score per sentence, then average
      let sentenceScoreSum = 0;
      let sentenceCount = 0;
      finalCorrect = 0;
      finalPartial = 0;
      for (const [start, end] of sentenceRanges) {
        const sentenceTokens = typeableTokens.filter(
          (t) => t.index >= start && t.index <= end
        );
        if (sentenceTokens.length === 0) continue;
        const sCorrect = sentenceTokens.filter((t) => finalSubmitted[t.index] === "correct").length;
        const sPartial = sentenceTokens.filter((t) => finalSubmitted[t.index] === "partial").length;
        finalCorrect += sCorrect;
        finalPartial += sPartial;
        const sCreditSum = sCorrect * 1.0 + sPartial * 0.8;
        sentenceScoreSum += sCreditSum / sentenceTokens.length;
        sentenceCount++;
      }
      finalScore = sentenceCount === 0 ? 0 : Math.round((sentenceScoreSum / sentenceCount) * 100);
    } else {
      finalCorrect = typeableTokens.filter((t) => finalSubmitted[t.index] === "correct").length;
      finalPartial = typeableTokens.filter((t) => finalSubmitted[t.index] === "partial").length;
      const finalCreditSum = typeableTokens.reduce(
        (sum, t) => sum + wordCredit(t.index, finalSubmitted[t.index]),
        0
      );
      finalScore = totalTypeable === 0 ? 0 : Math.round((finalCreditSum / totalTypeable) * 100);
    }

    return { finalScore, finalCorrect, finalPartial, finalHints, missedWords };
  }, [submitted, typedWords, typeableTokens, totalTypeable, hintUsed, activityType, sentenceRanges, wordCredit]);

  const handleBackPress = useCallback(() => {
    const answered = Object.keys(submitted).length;
    if (answered > 0) {
      Alert.alert("Leave session?", "Your progress for this session won't be saved.", [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => router.replace("/") },
      ]);
    } else {
      router.replace("/");
    }
  }, [submitted]);

  const commitSession = useCallback(async (
    finalScore: number,
    finalCorrect: number,
    finalPartial: number,
    finalHints: number,
    finalTotal: number,
    missedWords: string,
  ) => {
    const threshold = PHASE_THRESHOLD[actualPhase] ?? 80;
    const streakRequired = streakRequiredForPhase(actualPhase);
    const passedThreshold = finalScore >= threshold;

    const currentStreak = consecutiveGoodSessions;
    const currentSessionCount = sessionCountInPhase;

    // On fail we keep the streak instead of zeroing it, so the user repeats
    // the *current* activity rung rather than getting demoted back to the
    // first rung (e.g. failing first-letter shouldn't bounce them to
    // next-word quiz). Only a pass advances the streak.
    const newStreak = passedThreshold ? currentStreak + 1 : currentStreak;
    const newSessionCount = currentSessionCount + 1;

    const shouldAdvance = passedThreshold && newStreak >= streakRequired && actualPhase <= 3;

    const textId = params.textId;

    const isChunkMode = chunkIndexParam != null && activeChunk != null;
    const chunkMastered = isChunkMode && shouldAdvance && actualPhase >= 3;
    const totalChunks = entry?.chunks?.length ?? 0;
    const isLastChunk = isChunkMode && chunkIndexParam === totalChunks - 1;

    if (textId && textId !== "demo") {
      if (isChunkMode) {
        await recordChunkSession(
          {
            id: makeSessionId(),
            textId,
            phase: actualPhase,
            score: finalScore,
            completedAt: new Date().toISOString(),
            chunkIndex: chunkIndexParam,
          },
          finalScore,
          threshold,
        );
      } else if (isFullRun) {
        await recordSession({
          id: makeSessionId(),
          textId,
          phase: actualPhase,
          score: finalScore,
          completedAt: new Date().toISOString(),
        });
        if (passedThreshold) {
          markAsMastered(textId);
          await updateText(textId, { recallPct: finalScore, consecutiveGoodSessions: 0, sessionCountInPhase: 0 });
        }
      } else {
        await recordSession({
          id: makeSessionId(),
          textId,
          phase: actualPhase,
          score: finalScore,
          completedAt: new Date().toISOString(),
        });

        if (shouldAdvance) {
          advancePhase(textId);
          await updateText(textId, {
            recallPct: finalScore,
            consecutiveGoodSessions: 0,
            sessionCountInPhase: 0,
          });
        } else {
          await updateText(textId, {
            recallPct: finalScore,
            consecutiveGoodSessions: newStreak,
            sessionCountInPhase: newSessionCount,
          });
        }
      }
    }

    // One-time hint graduation toast — fires the first time the user reaches the
    // streak that hides the hint chip, so they understand it's intentional.
    try {
      if (isHintGraduationStreak(actualPhase, newStreak)) {
        const seen = await AsyncStorage.getItem(HINT_GRAD_STORAGE_KEY);
        if (!seen) {
          await AsyncStorage.setItem(HINT_GRAD_STORAGE_KEY, "1");
          await AsyncStorage.setItem("@verbitra:hint_graduation_pending", "1");
          setGradToast("You've graduated from hints — recall is locked in.");
        }
      }
    } catch {
      // Storage failure is non-fatal — just skip the toast.
    }

    router.push({
      pathname: "/results",
      params: {
        textId: textId ?? "",
        textTitle: titleText,
        score: String(finalScore),
        correct: String(finalCorrect),
        partial: String(finalPartial),
        total: String(finalTotal),
        hintsUsed: String(finalHints),
        phase: String(actualPhase),
        phaseAdvanced: (isFullRun ? passedThreshold : shouldAdvance) ? "true" : "false",
        chunkMastered: chunkMastered ? "true" : "false",
        chunkIndex: chunkIndexParam != null ? String(chunkIndexParam) : "",
        totalChunks: String(totalChunks),
        isLastChunk: isLastChunk ? "true" : "false",
        missedWords,
        streakCount: String(newStreak),
        streakRequired: String(streakRequired),
        threshold: String(threshold),
        isReview: isReview ? "true" : "false",
        isFlash: isFlash ? "true" : "false",
        isFullRun: isFullRun ? "true" : "false",
        activityName: activityMeta.name,
      },
    });
  }, [actualPhase, entry, params.textId, titleText, recordSession, recordChunkSession, updateText, advancePhase, markAsMastered, isReview, isFlash, isFullRun, chunkIndexParam, activeChunk, consecutiveGoodSessions, sessionCountInPhase, activityMeta.name]);

  const handleFinish = useCallback(async () => {
    if (pdTimerRef.current) {
      clearInterval(pdTimerRef.current);
      pdTimerRef.current = null;
    }
    setFinishing(true);
    const { finalScore, finalCorrect, finalPartial, finalHints, missedWords } = computeFinalScore();
    await commitSession(finalScore, finalCorrect, finalPartial, finalHints, totalTypeable, missedWords);
  }, [computeFinalScore, commitSession, totalTypeable]);

  const handleQuizSelect = useCallback((choice: number) => {
    if (qSelected != null) return;
    setQSelected(choice);
    const q = quizQuestions[qIdx];
    if (!q) return;
    const correct = choice === q.answerIndex;
    Vibration.vibrate(correct ? 20 : 40);
  }, [qSelected, quizQuestions, qIdx]);

  const handleQuizNext = useCallback(async () => {
    const q = quizQuestions[qIdx];
    if (!q || qSelected == null) return;
    const correct = qSelected === q.answerIndex;
    const nextResults = [...qResults, correct];
    setQResults(nextResults);
    setQSelected(null);
    if (qIdx + 1 >= quizQuestions.length) {
      const total = nextResults.length;
      const correctCt = nextResults.filter(Boolean).length;
      const finalScore = total === 0 ? 0 : Math.round((correctCt / total) * 100);
      const missed = quizQuestions
        .filter((_, i) => nextResults[i] === false)
        .map((qq) => qq.answer)
        .join("|");
      setFinishing(true);
      await commitSession(finalScore, correctCt, 0, 0, total, missed);
    } else {
      setQIdx(qIdx + 1);
    }
  }, [qIdx, qSelected, qResults, quizQuestions, commitSession]);

  // Auto-finish flash session when 2-minute timer expires
  const handleFinishRef = useRef(handleFinish);
  useEffect(() => { handleFinishRef.current = handleFinish; }, [handleFinish]);
  useEffect(() => {
    if (isFlash && flashTimeLeft <= 0) {
      handleFinishRef.current();
    }
  }, [isFlash, flashTimeLeft]);

  const handleAcronymGotIt = useCallback(async () => {
    const textId = params.textId;
    const threshold = PHASE_THRESHOLD[actualPhase] ?? 80;
    const streakRequired = streakRequiredForPhase(actualPhase);
    const sessionScore = 100;
    const currentStreak = consecutiveGoodSessions;
    const currentSessionCount = sessionCountInPhase;
    const newStreak = currentStreak + 1;
    const newSessionCount = currentSessionCount + 1;
    const shouldAdvance = newStreak >= streakRequired && actualPhase <= 3;

    const isChunkMode = chunkIndexParam != null && activeChunk != null;
    const chunkMastered = isChunkMode && shouldAdvance && actualPhase >= 3;
    const totalChunks = entry?.chunks?.length ?? 0;
    const isLastChunk = isChunkMode && chunkIndexParam === totalChunks - 1;

    if (textId && textId !== "demo") {
      if (isChunkMode) {
        await recordChunkSession(
          {
            id: makeSessionId(),
            textId,
            phase: actualPhase,
            score: sessionScore,
            completedAt: new Date().toISOString(),
            chunkIndex: chunkIndexParam,
          },
          sessionScore,
          threshold,
        );
      } else {
        await recordSession({
          id: makeSessionId(),
          textId,
          phase: actualPhase,
          score: sessionScore,
          completedAt: new Date().toISOString(),
        });
        if (shouldAdvance) {
          advancePhase(textId);
          await updateText(textId, { recallPct: sessionScore, consecutiveGoodSessions: 0, sessionCountInPhase: 0 });
        } else {
          await updateText(textId, { recallPct: sessionScore, consecutiveGoodSessions: newStreak, sessionCountInPhase: newSessionCount });
        }
      }
    }

    router.push({
      pathname: "/results",
      params: {
        textId: textId ?? "",
        textTitle: titleText,
        score: String(sessionScore),
        correct: "1",
        partial: "0",
        total: "1",
        hintsUsed: "0",
        phase: String(actualPhase),
        phaseAdvanced: shouldAdvance ? "true" : "false",
        chunkMastered: chunkMastered ? "true" : "false",
        chunkIndex: chunkIndexParam != null ? String(chunkIndexParam) : "",
        totalChunks: String(totalChunks),
        isLastChunk: isLastChunk ? "true" : "false",
        missedWords: "",
        streakCount: String(newStreak),
        streakRequired: String(streakRequired),
        threshold: String(threshold),
        isFullRun: "false",
      },
    });
  }, [actualPhase, entry, params.textId, titleText, recordSession, recordChunkSession, updateText, advancePhase, chunkIndexParam, activeChunk, consecutiveGoodSessions, sessionCountInPhase]);

  const handleRfNext = useCallback(() => {
    const currentRange = sentenceRanges[rfSentenceIdx];
    if (!currentRange) return;
    const [start, end] = currentRange;
    const currentSentenceTypeable = typeableTokens.filter(
      (t) => t.index >= start && t.index <= end
    );
    setSubmitted((prev) => {
      const next = { ...prev };
      for (const token of currentSentenceTypeable) {
        if (!next[token.index]) {
          const typed = (typedWords[token.index] ?? "").trim();
          if (typed) {
            next[token.index] = getSubmitResult(typed, token.w);
          }
        }
      }
      return next;
    });
    const nextIdx = rfSentenceIdx + 1;
    if (nextIdx >= sentenceRanges.length) {
      handleFinish();
    } else {
      setRfSentenceIdx(nextIdx);
      setActiveIndex(null);
    }
  }, [sentenceRanges, rfSentenceIdx, typeableTokens, typedWords, handleFinish]);

  const isRfLastSentence = activityType === "rapid-fire" && rfSentenceIdx >= sentenceRanges.length - 1;

  // PD: Finish is locked until all content words have been blanked (prevents early finish with tiny denominator).
  // Zero-eligible-word edge case (e.g. function-word-only text) is treated as immediately complete.
  const pdAllBlanked =
    activityType !== "progressive-deletion" ||
    pdContentIndices.length === 0 ||
    pdBlankedIndices.length >= pdContentIndices.length;
  const pdWordsRemaining = pdContentIndices.length - pdBlankedIndices.length;

  const renderToken = (token: WordToken) => {
    if (token.status === "punct") {
      return <Text key={token.index} style={styles.punctText}>{token.w}</Text>;
    }

    if (token.status === "correct") {
      return <Text key={token.index} style={styles.correctWord}>{token.w}</Text>;
    }

    if (activityType === "progressive-deletion") {
      const isBlocked = !pdBlankedIndices.includes(token.index);
      if (isBlocked) {
        return <Text key={token.index} style={styles.correctWord}>{token.w}</Text>;
      }
    }

    const result = submitted[token.index];

    // All typing activities: once submitted, replace TextInput with a static locked display.
    // This is the only reliable way to prevent re-editing — editable={false} alone is
    // not bulletproof on iOS with predictive text active.
    if (result) {
      const lockedText = (typedWords[token.index] ?? token.w).trim() || token.w;
      const lockedColor = result === "correct" ? T.text : result === "partial" ? T.hint : T.wrong;
      const lockedBorderColor = result === "correct" ? T.border : result === "partial" ? T.hint + "88" : T.wrong + "88";
      const lockedBg = result === "correct" ? "transparent" : result === "partial" ? T.hint + "15" : T.wrong + "12";
      return (
        <View
          key={token.index}
          style={[
            styles.blankBox,
            { borderColor: lockedBorderColor, backgroundColor: lockedBg, minWidth: Math.max(token.w.length * 10 + 12, 36) },
          ]}
        >
          <Text style={[styles.blankInput, { color: lockedColor }]}>{lockedText}</Text>
        </View>
      );
    }

    const isActive = activeIndex === token.index;
    const revealed = revealedChars[token.index] ?? 0;
    const hasHint = hintUsed[token.index];
    const isHintType = token.status === "hint";

    const boxStyle = isHintType ? styles.hintBox : styles.blankBox;
    const inputColor =
      result === "correct"
        ? T.correct
        : result === "partial"
        ? T.hint
        : result === "wrong"
        ? T.wrong
        : revealed > 0 && !result
        ? T.text
        : isHintType
        ? T.hint
        : T.text;

    const showFirstLetter = activityType === "first-letter" && !result && !typedWords[token.index];

    return (
      <Pressable
        key={token.index}
        onPress={() => {
          // Don't refocus fields that are already locked (submitted).
          if (submitted[token.index]) return;
          setActiveIndex(token.index);
          inputRefs.current[token.index]?.focus();
        }}
        onLongPress={() => handleHint(token.index)}
        delayLongPress={400}
        style={[
          boxStyle,
          { minWidth: Math.max(token.w.length * 10 + 12, 36) },
          result === "correct" && styles.boxCorrect,
          result === "partial" && styles.boxPartial,
          result === "wrong" && styles.boxWrong,
          isActive && styles.boxActive,
          hasHint && !result && styles.boxHinted,
          showFirstLetter && styles.boxFirstLetter,
        ]}
      >
        {showFirstLetter ? (
          <View style={styles.firstLetterRow}>
            <Text style={styles.firstLetterHint}>{token.w[0]}</Text>
            <TextInput
              ref={(r) => { inputRefs.current[token.index] = r; }}
              style={[styles.blankInput, { color: T.text }]}
              value={typedWords[token.index] ?? ""}
              onChangeText={(t) => handleChange(token.index, t)}
              onSubmitEditing={() => handleSubmit(token.index)}
              onFocus={() => setActiveIndex(token.index)}
              onBlur={() => setActiveIndex(null)}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="next"
              maxLength={token.w.length + 3}
              placeholder={"·".repeat(Math.max(1, token.w.length - 1))}
              placeholderTextColor={T.tertiary}
              editable={!result}
            />
          </View>
        ) : (
          <TextInput
            ref={(r) => { inputRefs.current[token.index] = r; }}
            style={[styles.blankInput, { color: inputColor }]}
            value={typedWords[token.index] ?? ""}
            onChangeText={(t) => handleChange(token.index, t)}
            onSubmitEditing={() => handleSubmit(token.index)}
            onFocus={() => setActiveIndex(token.index)}
            onBlur={() => setActiveIndex(null)}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="next"
            maxLength={token.w.length + 3}
            placeholder={"·".repeat(token.w.length)}
            placeholderTextColor={T.tertiary}
            editable={!result}
          />
        )}
      </Pressable>
    );
  };

  const showHintBar = activityType !== "progressive-deletion" && activityType !== "rapid-fire" && activityType !== "acronym-builder";
  const pdProgressPct = pdContentIndices.length === 0
    ? 0
    : Math.round((pdBlankedIndices.length / pdContentIndices.length) * 100);


  if (finishing) {
    return (
      <View style={[styles.container, { paddingTop: topPad, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={18} color={T.secondary} />
        </TouchableOpacity>
        <View style={styles.topLeft}>
          <View style={[styles.phaseBadge, { backgroundColor: phaseMeta.color + "1A", borderColor: phaseMeta.color + "44" }]}>
            <View style={[styles.phaseDot, { backgroundColor: phaseMeta.color }]} />
            <Text style={[styles.phaseLabel, { color: phaseMeta.color }]}>{phaseMeta.label}</Text>
          </View>
          <View style={styles.activityRow}>
            <View style={[styles.activityDot, { backgroundColor: activityMeta.color }]} />
            <View>
              <Text style={[styles.activityName, { color: activityMeta.color }]}>{activityMeta.name}</Text>
              <Text style={styles.activityDesc}>{activityMeta.desc}</Text>
            </View>
          </View>
        </View>
        <View style={styles.scoreRow}>
          {isFlash ? (
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreText, { color: flashTimeLeft <= 30 ? T.wrong : flashTimeLeft <= 60 ? T.hint : T.correct }]}>
                {Math.floor(flashTimeLeft / 60)}:{String(flashTimeLeft % 60).padStart(2, "0")}
              </Text>
              <Text style={styles.scoreSubText}>flash timer</Text>
            </View>
          ) : activityType === "acronym-builder" ? (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>Tip</Text>
              <Text style={styles.scoreSubText}>read & remember</Text>
            </View>
          ) : (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>{score}%</Text>
              <Text style={styles.scoreSubText}>{displayCorrect}/{displayTotal} correct</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {activityType === "rapid-fire" && sentenceRanges.length > 1 && (
        <View style={styles.rfProgress}>
          <Text style={styles.rfProgressText}>
            Sentence {rfSentenceIdx + 1} of {sentenceRanges.length}
          </Text>
          <View style={styles.rfDots}>
            {sentenceRanges.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.rfDot,
                  { backgroundColor: i < rfSentenceIdx ? T.correct : i === rfSentenceIdx ? activityMeta.color : T.border },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {activityType === "progressive-deletion" && (
        <View style={styles.pdStatus}>
          <View style={[styles.pdStatusDot, { backgroundColor: pdBlankedIndices.length > 0 ? T.wrong : T.tertiary }]} />
          <Text style={styles.pdStatusText}>
            {pdBlankedIndices.length === 0
              ? "Watch — words will fade one by one"
              : `${pdBlankedIndices.length} of ${pdContentIndices.length} words faded`}
          </Text>
          {pdBlankedIndices.length > 0 && (
            <Text style={[styles.pdStatusPct, { color: T.wrong }]}>{pdProgressPct}%</Text>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mnemonic && activityType !== "acronym-builder" && !gate1Locked && (
          <MnemonicScaffoldCard
            mnemonic={mnemonic}
            textId={entry?.id ?? ""}
            defaultExpanded={false}
          />
        )}

        {activityType === "acronym-builder" ? (
          <>
            {gate1Locked ? (
              <TouchableOpacity
                style={styles.proLockedCard}
                onPress={() => setPaywallVisible(true)}
                activeOpacity={0.85}
              >
                <View style={styles.proLockedIconRow}>
                  <Text style={styles.proLockedEmoji}>👑</Text>
                  <View style={styles.proLockedBadge}>
                    <Text style={styles.proLockedBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.proLockedTitle}>AI Acronym — Pro feature</Text>
                <Text style={styles.proLockedDesc}>
                  After 7 sessions, AI memory aids are unlocked with a Pro plan. Tap to upgrade and get personalized acronyms for faster recall.
                </Text>
                <View style={styles.proLockedBtn}>
                  <Text style={styles.proLockedBtnText}>Unlock Pro</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <>
                {abTipStatus === "loading" && (
                  <View style={styles.abLoadingCard}>
                    <ActivityIndicator color={T.primary} size="large" />
                    <Text style={styles.abLoadingText}>Generating your memory aid…</Text>
                  </View>
                )}

                {abTipStatus === "ready" && abTip && (
                  <>
                    <View style={styles.abAcronymCard}>
                      <Text style={styles.abAcronymLabel}>YOUR ACRONYM</Text>
                      <Text style={styles.abAcronymWord}>{abTip.acronym}</Text>
                    </View>

                    <View style={styles.abExplanationCard}>
                      <Text style={styles.abExplanationLabel}>HOW IT MAPS</Text>
                      <Text style={styles.abExplanationText}>{abTip.explanation}</Text>
                    </View>

                    <View style={styles.abHintInfo}>
                      <Text style={styles.abHintText}>ⓘ Memorise this acronym now · it will anchor the full list when you type from memory</Text>
                    </View>
                  </>
                )}

                {abTipStatus === "error" && (
                  <View style={styles.abErrorCard}>
                    <Text style={styles.abErrorTitle}>Couldn't generate acronym</Text>
                    <Text style={styles.abErrorSub}>Tap "Got it!" to continue without it</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : activityType === "next-word-quiz" ? (
          quizQuestions.length === 0 ? (
            <View style={styles.textCard}>
              <Text style={styles.textCardLabel}>{titleText}</Text>
              <Text style={[styles.hintInfoText, { marginTop: 12 }]}>
                Couldn't build a quiz from this text — tap Skip to continue.
              </Text>
            </View>
          ) : (
            (() => {
              const q = quizQuestions[qIdx];
              return (
                <View style={styles.textCard}>
                  <Text style={styles.textCardLabel}>
                    Question {qIdx + 1} of {quizQuestions.length}
                  </Text>
                  <Text style={styles.quizPrompt}>{q.prompt} ____</Text>
                  <View style={{ gap: 10, marginTop: 16 }}>
                    {q.choices.map((choice, i) => {
                      const isPicked = qSelected === i;
                      const isAnswer = i === q.answerIndex;
                      const showFeedback = qSelected != null;
                      let bg: string = T.surface2;
                      let bd: string = T.border;
                      let fg: string = T.text;
                      if (showFeedback && isAnswer) { bg = T.correct + "22"; bd = T.correct; fg = T.correct; }
                      else if (showFeedback && isPicked && !isAnswer) { bg = T.wrong + "22"; bd = T.wrong; fg = T.wrong; }
                      return (
                        <Pressable
                          key={i}
                          onPress={() => handleQuizSelect(i)}
                          disabled={qSelected != null}
                          style={{
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            borderWidth: 1.5,
                            backgroundColor: bg,
                            borderColor: bd,
                          }}
                        >
                          <Text style={{ fontSize: 16, color: fg, fontWeight: "600" as const }}>{choice}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })()
          )
        ) : (
          <View style={styles.textCard}>
            <Text style={styles.textCardLabel}>
              {titleText}
            </Text>
            <View style={styles.wordsContainer}>
              {visibleTokens.map(renderToken)}
            </View>
          </View>
        )}

        {showHintBar && (
          <View style={styles.hintInfo}>
            <Text style={styles.hintInfoIcon}>ⓘ</Text>
            <Text style={styles.hintInfoText}>
              {activityType === "first-letter"
                ? "First letter shown as a cue · type the full word · Return to confirm"
                : "Tap to type · Return to confirm · Long-press for a hint"}
            </Text>
          </View>
        )}

        {activityType === "progressive-deletion" && (
          <View style={styles.hintInfo}>
            <Text style={styles.hintInfoIcon}>⏱</Text>
            <Text style={styles.hintInfoText}>First word stays until you submit · then a new one appears every 7 seconds</Text>
          </View>
        )}

      </ScrollView>

      {hintChipEligible && activeIndex != null && !submitted[activeIndex] && (
        activityType === "guided-typing" || activityType === "first-letter" || activityType === "typing-memory"
      ) && (
        <View style={styles.hintChipBar}>
          <TouchableOpacity
            style={styles.hintChip}
            onPress={handleHintChip}
            activeOpacity={0.8}
            testID="practice-hint-chip"
          >
            <Feather name="eye" size={14} color={T.hint} />
            <Text style={styles.hintChipText}>Peek word</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {activityType === "rapid-fire" ? (
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={handleRfNext}
            activeOpacity={0.85}
            testID="practice-rf-next-btn"
          >
            <Text style={styles.bottomBtnText}>
              {isRfLastSentence ? "Finish" : "Next sentence →"}
            </Text>
          </TouchableOpacity>
        ) : activityType === "acronym-builder" ? (
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={handleAcronymGotIt}
            activeOpacity={0.85}
            testID="practice-exit-btn"
          >
            <Text style={styles.bottomBtnText}>Got it!</Text>
          </TouchableOpacity>
        ) : activityType === "next-word-quiz" ? (
          <TouchableOpacity
            style={[styles.bottomBtn, qSelected == null && quizQuestions.length > 0 && styles.bottomBtnDisabled]}
            onPress={
              quizQuestions.length === 0
                ? () => commitSession(100, 1, 0, 0, 1, "")
                : qSelected != null
                  ? handleQuizNext
                  : undefined
            }
            disabled={quizQuestions.length > 0 && qSelected == null}
            activeOpacity={0.85}
            testID="practice-quiz-next-btn"
          >
            <Text style={styles.bottomBtnText}>
              {quizQuestions.length === 0
                ? "Skip"
                : qIdx + 1 >= quizQuestions.length
                  ? "Finish"
                  : "Next →"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.bottomBtn, (!pdAllBlanked && !isReview && !isFlash) && styles.bottomBtnDisabled]}
            onPress={(pdAllBlanked || isReview || isFlash) ? handleFinish : undefined}
            disabled={!pdAllBlanked && !isReview && !isFlash}
            activeOpacity={0.85}
            testID="practice-exit-btn"
          >
            <Text style={styles.bottomBtnText}>
              {(isReview || isFlash || pdAllBlanked) ? "Finish" : `${pdWordsRemaining} left`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      </KeyboardAvoidingView>

      {gradToast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.gradToast,
            {
              opacity: gradToastAnim,
              transform: [{ translateY: gradToastAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
              top: insets.top + 12,
            },
          ]}
        >
          <Feather name="check-circle" size={16} color={T.correct} />
          <Text style={styles.gradToastText}>{gradToast}</Text>
        </Animated.View>
      )}

      <PaywallModal
        visible={paywallVisible}
        onDismiss={() => setPaywallVisible(false)}
        reason="gate1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topLeft: { flexDirection: "column", gap: 4, flex: 1 },
  backBtn: { padding: 4, marginTop: 2, marginRight: 4 },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  phaseDot: { width: 5, height: 5, borderRadius: 3 },
  phaseLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.5 },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingLeft: 2 },
  activityDot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  activityName: { fontSize: 14, fontWeight: "700" as const, letterSpacing: 0.1 },
  activityDesc: { fontSize: 11, color: T.secondary, marginTop: 2 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  scoreBox: { alignItems: "flex-end" },
  scoreText: { fontSize: 18, fontWeight: "700" as const, color: T.text, letterSpacing: -0.3, lineHeight: 20 },
  scoreSubText: { fontSize: 10, color: T.tertiary },
  exitBtn: { backgroundColor: T.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  exitBtnDisabled: { backgroundColor: T.border, opacity: 0.7 },
  exitBtnText: { fontSize: 13, color: "#fff", fontWeight: "600" as const },
  progressTrack: {
    height: 2,
    backgroundColor: T.surface2,
    marginHorizontal: 20,
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: { height: "100%", backgroundColor: T.primary, borderRadius: 1 },
  rfProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: T.surface + "CC",
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  rfProgressText: { fontSize: 11, fontWeight: "600" as const, color: T.secondary },
  rfDots: { flexDirection: "row", gap: 5 },
  rfDot: { width: 8, height: 8, borderRadius: 4 },
  pdStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: T.surface + "CC",
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  pdStatusDot: { width: 6, height: 6, borderRadius: 3 },
  pdStatusText: { fontSize: 11, color: T.secondary, flex: 1 },
  pdStatusPct: { fontSize: 11, fontWeight: "700" as const },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 40 },
  textCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 16,
  },
  textCardLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 14,
    lineHeight: 16,
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  punctText: { fontSize: 16, color: T.secondary, fontFamily: "Lora_400Regular", lineHeight: 36 },
  correctWord: { fontSize: 16, color: T.correct, fontFamily: "Lora_400Regular", lineHeight: 36 },
  blankBox: {
    backgroundColor: T.surface2,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minHeight: 34,
    justifyContent: "center",
  },
  hintBox: {
    backgroundColor: T.hint + "15",
    borderWidth: 1.5,
    borderColor: T.hint + "88",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minHeight: 34,
    minWidth: 48,
    justifyContent: "center",
  },
  boxFirstLetter: {
    backgroundColor: T.primary + "12",
    borderColor: T.primary + "55",
  },
  boxCorrect: { borderColor: T.correct, backgroundColor: T.correct + "15" },
  boxPartial: { borderColor: T.hint, backgroundColor: T.hint + "15" },
  boxWrong: { borderColor: T.wrong, backgroundColor: T.wrong + "12" },
  boxActive: { borderColor: T.primary, borderWidth: 2 },
  blankInput: {
    fontSize: 15,
    fontFamily: "Lora_400Regular",
    color: T.text,
    padding: 0,
    minWidth: 20,
  },
  boxHinted: { borderColor: T.hint, backgroundColor: T.hint + "18" },
  firstLetterRow: { flexDirection: "row", alignItems: "center", gap: 1 },
  firstLetterHint: {
    fontSize: 15,
    fontFamily: "Lora_400Regular",
    color: T.primary,
    fontWeight: "700" as const,
    lineHeight: 20,
  },
  hintInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.hint + "10",
    borderWidth: 1,
    borderColor: T.hint + "33",
    borderRadius: 10,
    padding: 10,
  },
  hintInfoIcon: { fontSize: 13, color: T.hint },
  hintInfoText: { fontSize: 12, color: T.hint, flex: 1 },
  quizPrompt: { fontSize: 18, color: T.text, lineHeight: 26, marginTop: 8, fontWeight: "500" as const },
  hintChipBar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: T.surface,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  hintChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.hint + "55",
    backgroundColor: T.hint + "12",
  },
  hintChipText: { fontSize: 13, fontWeight: "600" as const, color: T.hint },
  gradToast: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.correct + "55",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  gradToastText: { flex: 1, fontSize: 13, color: T.text, fontWeight: "600" as const },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.border,
    backgroundColor: T.bg,
  },
  bottomBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  bottomBtnDisabled: {
    backgroundColor: T.border,
  },
  bottomBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  rfNextBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  rfNextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  abLoadingCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 60,
  },
  abLoadingText: { fontSize: 14, color: T.secondary },
  abAcronymCard: {
    backgroundColor: T.primary + "18",
    borderWidth: 2,
    borderColor: T.primary + "55",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 14,
  },
  abAcronymLabel: {
    fontSize: 11,
    color: T.primary,
    fontWeight: "700" as const,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  abAcronymWord: {
    fontSize: 52,
    color: T.text,
    fontWeight: "800" as const,
    letterSpacing: 6,
    fontFamily: "Lora_700Bold",
  },
  abExplanationCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  abExplanationLabel: {
    fontSize: 11,
    color: T.secondary,
    fontWeight: "600" as const,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  abExplanationText: {
    fontSize: 14,
    color: T.text,
    lineHeight: 22,
    fontFamily: "Lora_400Regular",
  },
  abHintInfo: {
    backgroundColor: T.primary + "10",
    borderWidth: 1,
    borderColor: T.primary + "33",
    borderRadius: 10,
    padding: 10,
  },
  abHintText: { fontSize: 12, color: T.primary },
  abErrorCard: {
    backgroundColor: T.wrong + "12",
    borderWidth: 1,
    borderColor: T.wrong + "44",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  abErrorTitle: { fontSize: 16, color: T.wrong, fontWeight: "700" as const },
  abErrorSub: { fontSize: 13, color: T.secondary },
  proLockedCard: {
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.primary + "44",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  proLockedIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  proLockedEmoji: { fontSize: 32 },
  proLockedBadge: {
    backgroundColor: T.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proLockedBadgeText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#fff",
    letterSpacing: 1,
  },
  proLockedTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: T.text,
    textAlign: "center",
  },
  proLockedDesc: {
    fontSize: 13,
    color: T.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  proLockedBtn: {
    backgroundColor: T.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 11,
    marginTop: 4,
  },
  proLockedBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
  },
});
