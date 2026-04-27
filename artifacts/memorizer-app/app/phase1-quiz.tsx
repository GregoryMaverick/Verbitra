import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { generateQuiz, type QuizQuestion } from "@/lib/highlightQuiz";

function makeSessionId(): string {
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${(0x8 | (Math.random() * 4)).toString(16)}${hex().slice(1)}-${hex()}${hex()}${hex()}`;
}

export default function Phase1QuizScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ textId: string; textTitle?: string; chunkIndex?: string }>();
  const { texts, recordSession, advanceChunkPhase, updateText } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const textId = params.textId ?? "";
  const textTitle = params.textTitle ?? "Your text";
  const chunkIndexParam = params.chunkIndex != null && params.chunkIndex !== "" ? Number(params.chunkIndex) : null;
  const entry = texts.find((t) => t.id === textId);
  const activeChunk = chunkIndexParam != null ? entry?.chunks?.find((c) => c.index === chunkIndexParam) ?? null : null;
  const content = activeChunk ? activeChunk.content : (entry?.content ?? "");

  const questions = useMemo<QuizQuestion[]>(() => generateQuiz(content), [content]);

  const [qIdx, setQIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Refs for race-safe state: synchronous re-entrancy lock, mount tracking, and timeout cleanup
  const lockedRef = useRef(false);
  const mountedRef = useRef(true);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const currentQ = questions[qIdx];
  const total = questions.length;
  const isLast = qIdx === total - 1;

  // Cleanup on unmount: clear any pending advance timeout and mark unmounted
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
    };
  }, []);

  // If no questions can be generated (very short text), skip straight to results
  useEffect(() => {
    if (total === 0 && entry) {
      finishSession(100);
    }
  }, [total, entry]);

  const finishSession = async (score: number) => {
    if (finishedRef.current || !mountedRef.current) return;
    finishedRef.current = true;
    setIsFinishing(true);
    try {
      if (textId && textId !== "demo") {
        if (chunkIndexParam != null && activeChunk) {
          await recordSession({
            id: makeSessionId(),
            textId,
            phase: 1,
            score,
            completedAt: new Date().toISOString(),
            chunkIndex: chunkIndexParam,
          });
          advanceChunkPhase(textId, chunkIndexParam);
        } else {
          await recordSession({
            id: makeSessionId(),
            textId,
            phase: 1,
            score,
            completedAt: new Date().toISOString(),
          });
          // Only advance to Phase 2 if user actually demonstrated reading comprehension.
          // Otherwise keep them on Phase 1 (Reading) so they can re-read and re-quiz.
          if (score >= 80) {
            await updateText(textId, { phase: 2, phaseColor: T.hint });
          }
        }
      }
      router.push({
        pathname: "/results",
        params: {
          textId,
          textTitle,
          score: String(score),
          correct: String(Math.round((score / 100) * Math.max(1, total))),
          total: String(Math.max(1, total)),
          hintsUsed: "0",
          phase: "1",
          phaseAdvanced: chunkIndexParam == null && score >= 80 ? "true" : "false",
          chunkMastered: "false",
          chunkIndex: chunkIndexParam != null ? String(chunkIndexParam) : "",
          totalChunks: "0",
          isLastChunk: "false",
          isFullRun: "false",
          missedWords: "",
          activityName: "Read & Quick Quiz",
        },
      });
    } finally {
      setIsFinishing(false);
    }
  };

  const advance = (correctSoFar: number) => {
    if (!mountedRef.current) return;
    advanceTimeoutRef.current = null;
    if (isLast) {
      const finalScore = Math.round((correctSoFar / total) * 100);
      finishSession(finalScore);
      return;
    }
    setQIdx((i) => i + 1);
    setSelectedIdx(null);
    setIsLocked(false);
    lockedRef.current = false;
  };

  const handleChoice = (choiceIdx: number) => {
    // Synchronous guard: blocks rapid double-taps before React re-renders
    if (lockedRef.current || !currentQ) return;
    lockedRef.current = true;
    setIsLocked(true);
    setSelectedIdx(choiceIdx);
    const isCorrect = choiceIdx === currentQ.answerIndex;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    if (isCorrect) {
      setCorrectCount(newCorrect);
      // Auto-advance on correct after brief feedback (cleared on unmount)
      advanceTimeoutRef.current = setTimeout(() => advance(newCorrect), 500);
    }
    // On wrong, wait for "Got it" tap (handled by bottom bar button → advance(correctCount))
  };

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={{ color: T.text, padding: 20 }}>Text not found.</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: T.tertiary, fontSize: 14 }}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (!currentQ) return null;

  const showFeedback = selectedIdx !== null;
  const wasCorrect = showFeedback && selectedIdx === currentQ.answerIndex;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={20} color={T.tertiary} />
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.titleText} numberOfLines={1}>{textTitle}</Text>
          <Text style={styles.subtitleText}>Phase 1 · Quick Quiz</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.progressRow}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < qIdx && { backgroundColor: T.correct },
              i === qIdx && { backgroundColor: T.primary },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionLabel}>
          Question {qIdx + 1} of {total}
        </Text>

        <View style={styles.promptCard}>
          <Text style={styles.promptText}>"{currentQ.prompt}…"</Text>
        </View>

        <Text style={styles.askText}>What word comes next?</Text>

        <View style={styles.choicesGrid}>
          {currentQ.choices.map((choice, i) => {
            const isSelected = selectedIdx === i;
            const isAnswer = i === currentQ.answerIndex;
            const showAsCorrect = showFeedback && isAnswer;
            const showAsWrong = showFeedback && isSelected && !isAnswer;

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.choiceBtn,
                  showAsCorrect && styles.choiceBtnCorrect,
                  showAsWrong && styles.choiceBtnWrong,
                  isLocked && !showAsCorrect && !showAsWrong && styles.choiceBtnDim,
                ]}
                onPress={() => handleChoice(i)}
                disabled={isLocked}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.choiceText,
                    showAsCorrect && { color: T.correct },
                    showAsWrong && { color: T.wrong },
                  ]}
                >
                  {choice}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && !wasCorrect && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackLabel}>Correct answer</Text>
            <Text style={styles.feedbackText}>
              "{currentQ.prompt} <Text style={{ color: T.correct, fontWeight: "700" }}>{currentQ.answer}</Text>…"
            </Text>
          </View>
        )}
      </ScrollView>

      {showFeedback && !wasCorrect && (
        <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12 }]}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => advance(correctCount)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>{isLast ? "Finish" : "Got it · Next"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  titleBox: { flex: 1, alignItems: "center" },
  titleText: { fontSize: 13, fontWeight: "600", color: T.text },
  subtitleText: { fontSize: 10, color: T.tertiary, marginTop: 1, letterSpacing: 0.4 },
  progressRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.surface2,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  questionLabel: {
    fontSize: 11,
    color: T.tertiary,
    letterSpacing: 0.6,
    fontWeight: "600",
    marginBottom: 12,
  },
  promptCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  promptText: {
    fontSize: 18,
    color: T.text,
    lineHeight: 26,
    fontStyle: "italic",
  },
  askText: {
    fontSize: 13,
    color: T.tertiary,
    marginBottom: 14,
    textAlign: "center",
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  choiceBtn: {
    width: "48%",
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: T.border,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  choiceBtnCorrect: {
    borderColor: T.correct,
    backgroundColor: T.correct + "12",
  },
  choiceBtnWrong: {
    borderColor: T.wrong,
    backgroundColor: T.wrong + "12",
  },
  choiceBtnDim: { opacity: 0.45 },
  choiceText: {
    fontSize: 16,
    fontWeight: "600",
    color: T.text,
    textAlign: "center",
  },
  feedbackCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
  },
  feedbackLabel: {
    fontSize: 10,
    color: T.tertiary,
    letterSpacing: 0.6,
    fontWeight: "600",
    marginBottom: 6,
  },
  feedbackText: { fontSize: 15, color: T.text, lineHeight: 22, fontStyle: "italic" },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.border,
    backgroundColor: T.bg,
  },
  continueBtn: {
    backgroundColor: T.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
