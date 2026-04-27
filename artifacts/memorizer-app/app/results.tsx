import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { T } from "@/constants/tokens";
import { useApp, type FsrsRating } from "@/context/AppContext";
import { useAuth } from "@/lib/auth";
import { RATING_META } from "@/lib/fsrs";
import { scheduleSessionNotification, scheduleOverdueNudge } from "@/hooks/useNotifications";
import { useSubscription } from "@/lib/revenuecat";
import PaywallModal from "@/components/PaywallModal";
import { SUBSCRIPTIONS_ENABLED } from "@/constants/features";
import { getNextSessionInfo } from "@/lib/nextSession";

const GATE1_KEY = "@memorizer:gate1_shown";
const GATE1_SESSION_THRESHOLD = 7;

function getPhaseLabel(phase: number): string {
  if (phase === 1) return "Phase 1 · Read & Listen";
  if (phase === 3) return "Phase 3 · Recall";
  return "Phase 2 · Guided Typing";
}

function getPhaseColor(phase: number): string {
  if (phase === 1) return T.primary;
  if (phase === 3) return T.correct;
  return T.hint;
}

function getNextPhaseLabel(phase: number): string {
  if (phase === 1) return "Phase 2 · Guided Typing";
  if (phase === 2) return "Phase 3 · Recall";
  return "Mastered";
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const {
    textId,
    textTitle: textTitleParam,
    score: scoreParam,
    correct: correctParam,
    partial: partialParam,
    total: totalParam,
    hintsUsed: hintsUsedParam,
    phase: phaseParam,
    phaseAdvanced: phaseAdvancedParam,
    missedWords: missedWordsParam,
    streakCount: streakCountParam,
    streakRequired: streakRequiredParam,
    threshold: thresholdParam,
    isReview: isReviewParam,
    isFlash: isFlashParam,
    chunkMastered: chunkMasteredParam,
    chunkIndex: chunkIndexParam,
    totalChunks: totalChunksParam,
    isLastChunk: isLastChunkParam,
    isFullRun: isFullRunParam,
    activityName: activityNameParam,
  } = useLocalSearchParams<{
    textId?: string;
    textTitle?: string;
    score?: string;
    correct?: string;
    partial?: string;
    total?: string;
    hintsUsed?: string;
    phase?: string;
    phaseAdvanced?: string;
    missedWords?: string;
    streakCount?: string;
    streakRequired?: string;
    threshold?: string;
    isReview?: string;
    isFlash?: string;
    chunkMastered?: string;
    chunkIndex?: string;
    totalChunks?: string;
    isLastChunk?: string;
    isFullRun?: string;
    activityName?: string;
  }>();
  const IS_REVIEW = isReviewParam === "true";
  const IS_FLASH = isFlashParam === "true";
  const { texts, sessions, notificationSettings, submitReview, recordFlash } = useApp();
  const { isAuthenticated } = useAuth();
  const { isSubscribed } = useSubscription();
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const sessionTextTitle = textTitleParam ?? texts.find((t) => t.id === textId)?.title ?? "Your text";

  const SCORE = scoreParam ? Number(scoreParam) : 0;
  const CORRECT = correctParam ? Number(correctParam) : 0;
  const PARTIAL = partialParam ? Number(partialParam) : 0;
  const TOTAL = totalParam ? Number(totalParam) : 0;
  const HINTS_USED = hintsUsedParam ? Number(hintsUsedParam) : 0;
  const PHASE = phaseParam ? Number(phaseParam) : 2;
  const PHASE_ADVANCED = phaseAdvancedParam === "true";
  const MISSED_WORDS = missedWordsParam ? missedWordsParam.split("|").filter(Boolean) : [];
  const MASTERED = PHASE_ADVANCED && PHASE >= 3;
  const CHUNK_MASTERED = chunkMasteredParam === "true";
  const CHUNK_INDEX = chunkIndexParam ? Number(chunkIndexParam) : null;
  const TOTAL_CHUNKS = totalChunksParam ? Number(totalChunksParam) : 0;
  const IS_LAST_CHUNK = isLastChunkParam === "true";
  const IS_FULL_RUN = isFullRunParam === "true";
  const STREAK_COUNT = streakCountParam ? Number(streakCountParam) : 0;
  const STREAK_REQUIRED = streakRequiredParam ? Number(streakRequiredParam) : 2;
  const THRESHOLD = thresholdParam ? Number(thresholdParam) : 80;
  const ACTIVITY_NAME = activityNameParam ?? "";

  const PHASE_PROGRESS = Math.min(SCORE / THRESHOLD, 1);
  const scoreColor = SCORE >= THRESHOLD ? T.correct : SCORE >= THRESHOLD * 0.75 ? T.hint : T.wrong;
  const phaseColor = getPhaseColor(PHASE);

  const [showMissedModal, setShowMissedModal] = useState(false);

  const currentText = texts.find((t) => t.id === textId);
  const todayStr = new Date().toISOString().slice(0, 10);
  const sessionsToday = textId
    ? sessions.filter((s) => s.textId === textId && s.completedAt.startsWith(todayStr)).length
    : 0;
  const showSession2CTA =
    !IS_REVIEW &&
    !IS_FLASH &&
    currentText?.mode === "intensive" &&
    sessionsToday < 2 &&
    !!textId &&
    textId !== "demo";

  useEffect(() => {
    if (!textId || Platform.OS === "web") return;
    const text = texts.find((t) => t.id === textId);
    if (!text || !text.notificationsEnabled || !notificationSettings.globalEnabled) return;

    const nextSession = new Date();
    nextSession.setDate(nextSession.getDate() + 1);

    const deadline = text.deadlineDate
      ? new Date(text.deadlineDate)
      : new Date(Date.now() + text.daysLeft * 24 * 60 * 60 * 1000);

    scheduleSessionNotification({
      textId: text.id,
      textTitle: text.title,
      deadlineDate: deadline,
      nextSessionAt: nextSession,
      daysLeft: text.daysLeft,
      reminderHour: notificationSettings.reminderHour,
      reminderMinute: notificationSettings.reminderMinute,
    });

    const overdueNudge = new Date();
    overdueNudge.setDate(overdueNudge.getDate() + 3);
    scheduleOverdueNudge({
      textId: text.id,
      textTitle: text.title,
      nudgeAt: overdueNudge,
    });
  }, [textId]);

  // Record flash session when screen mounts in flash mode
  useEffect(() => {
    if (IS_FLASH && textId && textId !== "demo") {
      recordFlash(textId).catch(() => {});
    }
  }, []);

  // One-time hint graduation banner — set by practice screen when the user
  // reaches the streak that hides the hint chip. Cleared after first display.
  const [hintGradBanner, setHintGradBanner] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("@verbitra:hint_graduation_pending").then((val) => {
      if (val) {
        setHintGradBanner(true);
        AsyncStorage.removeItem("@verbitra:hint_graduation_pending").catch(() => {});
      }
    }).catch(() => {});
  }, []);

  // Gate 1: show paywall once after session 7 for non-subscribers (active when SUBSCRIPTIONS_ENABLED)
  useEffect(() => {
    if (!SUBSCRIPTIONS_ENABLED) return;
    if (IS_REVIEW || IS_FLASH) return;
    if (isSubscribed) return;
    if (sessions.length < GATE1_SESSION_THRESHOLD) return;
    AsyncStorage.getItem(GATE1_KEY).then((val) => {
      if (!val) {
        setPaywallVisible(true);
      }
    }).catch(() => {});
  }, [isSubscribed, sessions.length, IS_REVIEW, IS_FLASH]);

  // Sign-in is opt-in only via the Settings tab — no automatic prompts or
  // forced redirects from the practice flow.

  const handleRating = async (rating: FsrsRating) => {
    if (!textId || textId === "demo" || ratingSubmitted) return;
    setRatingSubmitted(true);
    await submitReview(textId, rating);
    router.replace("/");
  };

  const handleBackHome = () => {
    router.replace("/");
  };

  if (IS_FLASH) {
    return (
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.flashCompleteContainer}>
          <View style={styles.flashCompleteIcon}>
            <Text style={styles.flashCompleteEmoji}>⚡</Text>
          </View>
          <Text style={styles.flashCompleteTitle}>Flash complete!</Text>
          <Text style={styles.flashCompleteSub}>
            Rapid recall keeps your memory sharp. Well done — see you in 7 days.
          </Text>
          <TouchableOpacity
            style={[styles.homeBtn, { marginTop: 32 }]}
            onPress={handleBackHome}
            activeOpacity={0.85}
          >
            <Text style={styles.homeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hintGradBanner && (
          <View style={styles.hintGradBanner}>
            <Feather name="award" size={14} color={T.primary} />
            <Text style={styles.hintGradBannerText}>
              You've graduated from hints — recall is locked in.
            </Text>
          </View>
        )}
        <View style={styles.scoreSection}>
          {PHASE === 1 && TOTAL > 0 ? (
            <>
              <Text style={styles.sessionCompleteLabel}>Practice complete</Text>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {SCORE}%
              </Text>
              <Text style={styles.scoreSub}>
                <Text style={{ color: scoreColor, fontWeight: "600" as const }}>
                  {CORRECT}
                </Text>
                <Text style={{ color: T.tertiary }}> of {TOTAL} blanks recalled</Text>
              </Text>
            </>
          ) : PHASE === 1 ? (
            <>
              <Text style={styles.sessionCompleteLabel}>Reading complete</Text>
              <Text style={[styles.scoreNumber, { color: T.primary, fontSize: 56 }]}>
                Phase 1
              </Text>
              <Text style={styles.scoreSub}>
                <Text style={{ color: T.secondary }}>You've read the text once.</Text>
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.sessionCompleteLabel}>Session complete</Text>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {SCORE}%
              </Text>
              <Text style={styles.scoreSub}>
                <Text style={{ color: scoreColor, fontWeight: "600" as const }}>
                  Score {SCORE}%
                </Text>
                {HINTS_USED > 0 && (
                  <Text style={{ color: T.tertiary }}>
                    {" "}· used {HINTS_USED} {HINTS_USED === 1 ? "hint" : "hints"}
                  </Text>
                )}
              </Text>
            </>
          )}
        </View>

        {CHUNK_MASTERED && CHUNK_INDEX != null && (
          <View style={[styles.phaseAdvanceCard, { borderColor: T.correct + "44", backgroundColor: T.correct + "10" }]}>
            <View style={[styles.phaseAdvanceIcon, { backgroundColor: T.correct + "22" }]}>
              <Text style={styles.phaseAdvanceEmoji}>{IS_LAST_CHUNK ? "🏆" : "🔓"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phaseAdvanceTitle, { color: T.correct }]}>
                {IS_LAST_CHUNK
                  ? "All chunks mastered — Full run unlocked!"
                  : `Chunk ${CHUNK_INDEX + 1} complete — Chunk ${CHUNK_INDEX + 2} unlocked!`}
              </Text>
              <Text style={styles.phaseAdvanceSub}>
                {IS_LAST_CHUNK
                  ? "You've mastered every section. A full run is now available on the home screen."
                  : "Great work! The next section is now available to practice."}
              </Text>
            </View>
          </View>
        )}

        {IS_FULL_RUN && PHASE_ADVANCED && (
          <View style={[styles.phaseAdvanceCard, { borderColor: T.primary + "44", backgroundColor: T.primary + "10" }]}>
            <View style={[styles.phaseAdvanceIcon, { backgroundColor: T.primary + "22" }]}>
              <Text style={styles.phaseAdvanceEmoji}>🏆</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phaseAdvanceTitle, { color: T.primary }]}>
                Full run complete! Text mastered.
              </Text>
              <Text style={styles.phaseAdvanceSub}>
                You recalled the whole text from memory. Keep it sharp with occasional reviews.
              </Text>
            </View>
          </View>
        )}

        {!CHUNK_MASTERED && !IS_FULL_RUN && PHASE_ADVANCED && (
          <View style={styles.phaseAdvanceCard}>
            <View style={styles.phaseAdvanceIcon}>
              <Text style={styles.phaseAdvanceEmoji}>🎉</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.phaseAdvanceTitle}>
                {MASTERED ? "Text mastered!" : "Phase unlocked!"}
              </Text>
              <Text style={styles.phaseAdvanceSub}>
                {MASTERED
                  ? "You've recalled this text unaided at 80%+. Keep it sharp by reviewing occasionally."
                  : `You've unlocked ${getNextPhaseLabel(PHASE)}. Your next session will be harder.`}
              </Text>
            </View>
          </View>
        )}

        {PHASE > 1 && TOTAL > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Word accuracy</Text>
            <View style={styles.accuracyGrid}>
              {[...Array(TOTAL)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.accuracyDot,
                    {
                      backgroundColor:
                        i < CORRECT
                          ? T.correct + "CC"
                          : i < CORRECT + PARTIAL
                          ? T.hint + "CC"
                          : T.wrong + "88",
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: T.correct }]} />
                <Text style={styles.legendText}>Correct ({CORRECT})</Text>
              </View>
              {PARTIAL > 0 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: T.hint }]} />
                  <Text style={styles.legendText}>Near ({PARTIAL})</Text>
                </View>
              )}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: T.wrong + "88" }]} />
                <Text style={styles.legendText}>Missed ({TOTAL - CORRECT - PARTIAL})</Text>
              </View>
            </View>
          </View>
        )}

        {!IS_REVIEW && <View style={styles.card}>
          <Text style={styles.cardLabel}>Phase progress</Text>
          <View style={styles.phaseHeaderRow}>
            <View style={[styles.phaseBadge, { backgroundColor: phaseColor + "1A", borderColor: phaseColor + "44" }]}>
              <View style={[styles.phaseBadgeDot, { backgroundColor: phaseColor }]} />
              <Text style={[styles.phaseBadgeText, { color: phaseColor }]}>
                {getPhaseLabel(PHASE)}
              </Text>
            </View>
            {PHASE > 1 && (
              <Text style={styles.phasePercent}>
                {Math.round(Math.min(SCORE, THRESHOLD))} / {THRESHOLD}% to pass
              </Text>
            )}
          </View>
          {PHASE > 1 && (
            <>
              <View style={styles.phaseBarTrack}>
                <View
                  style={[
                    styles.phaseBarFill,
                    { width: `${PHASE_PROGRESS * 100}%`, backgroundColor: SCORE >= THRESHOLD ? T.correct : T.primary },
                  ]}
                />
              </View>

              {STREAK_REQUIRED > 1 && (
                <View style={styles.streakRow}>
                  <Text style={styles.streakLabel}>Consecutive sessions needed</Text>
                  <View style={styles.streakDots}>
                    {[...Array(STREAK_REQUIRED)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.streakDot,
                          { backgroundColor: i < STREAK_COUNT ? T.correct : T.surface2, borderColor: i < STREAK_COUNT ? T.correct : T.border },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.streakCountText, { color: STREAK_COUNT > 0 ? T.correct : T.tertiary }]}>
                    {STREAK_COUNT}/{STREAK_REQUIRED}
                  </Text>
                </View>
              )}

              {!PHASE_ADVANCED && (
                <Text style={styles.phaseUnlockText}>
                  {SCORE >= THRESHOLD ? (
                    STREAK_COUNT < STREAK_REQUIRED ? (
                      <Text style={{ color: T.hint }}>
                        Good session! {STREAK_REQUIRED - STREAK_COUNT} more consecutive {STREAK_REQUIRED - STREAK_COUNT === 1 ? "session" : "sessions"} to advance
                      </Text>
                    ) : null
                  ) : (
                    <>
                      <Text style={{ color: T.primary }}>Next session:</Text>
                      {" "}same activity{ACTIVITY_NAME ? ` (${ACTIVITY_NAME})` : ""} · keep going until you score {THRESHOLD}%+
                    </>
                  )}
                </Text>
              )}
            </>
          )}
          {PHASE === 1 && (
            <Text style={styles.phaseUnlockText}>
              {PHASE_ADVANCED ? (
                <>Next session: <Text style={{ color: T.hint }}>Phase 2 · Guided Typing</Text></>
              ) : TOTAL > 0 ? (
                <>
                  <Text style={{ color: T.primary }}>{Math.max(0, 60 - SCORE)}%</Text>
                  {" "}more to unlock Phase 2 · keep filling the blanks
                </>
              ) : null}
            </Text>
          )}
        </View>}

        <View style={styles.nextSessionCard}>
          <View style={styles.nextSessionLeft}>
            <View style={styles.nextSessionIconBox}>
              <Feather name="clock" size={14} color={T.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.nextSessionTitle}>Next session</Text>
              <Text style={styles.nextSessionSub} numberOfLines={1}>{sessionTextTitle}</Text>
            </View>
          </View>
          <View style={styles.nextSessionRight}>
            {(() => {
              const next = currentText
                ? getNextSessionInfo(currentText, sessionsToday, true)
                : { label: showSession2CTA ? "Today" : "Tomorrow", sub: "", isToday: !!showSession2CTA };
              return (
                <>
                  <Text style={[styles.nextSessionDay, next.isToday && { color: T.hint }]}>
                    {next.label}
                  </Text>
                  <Text style={styles.nextSessionTime}>
                    {next.sub ||
                      `${String(notificationSettings.reminderHour % 12 || 12).padStart(2, "0")}:${String(notificationSettings.reminderMinute).padStart(2, "0")} ${notificationSettings.reminderHour >= 12 ? "PM" : "AM"}`}
                  </Text>
                </>
              );
            })()}
          </View>
        </View>

        {IS_REVIEW ? (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>How well did you recall it?</Text>
            <Text style={styles.ratingSubtitle}>Your rating sets the next review interval</Text>
            <View style={styles.ratingGrid}>
              {([1, 2, 3, 4] as FsrsRating[]).map((r) => {
                const meta = RATING_META[r];
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.ratingBtn,
                      { borderColor: meta.color + "66", backgroundColor: meta.color + "12" },
                      ratingSubmitted && styles.ratingBtnDisabled,
                    ]}
                    onPress={() => handleRating(r)}
                    disabled={ratingSubmitted}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.ratingBtnLabel, { color: meta.color }]}>{meta.label}</Text>
                    <Text style={styles.ratingBtnDesc}>{meta.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <>
            {showSession2CTA && (
              <TouchableOpacity
                style={styles.session2Btn}
                onPress={() =>
                  router.replace({
                    pathname: "/practice",
                    params: { textId: textId!, textTitle: sessionTextTitle },
                  })
                }
                activeOpacity={0.85}
                testID="results-session2-btn"
              >
                <Text style={styles.session2BtnText}>Start session 2</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.homeBtn, showSession2CTA && styles.homeBtnSecondary]}
              onPress={handleBackHome}
              activeOpacity={0.85}
              testID="results-home-btn"
            >
              <Text style={[styles.homeBtnText, showSession2CTA && styles.homeBtnSecondaryText]}>
                Back to home
              </Text>
            </TouchableOpacity>
          </>
        )}

        {MISSED_WORDS.length > 0 && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => setShowMissedModal(true)}
            testID="results-review-btn"
          >
            <Text style={styles.reviewBtnText}>Review {MISSED_WORDS.length} missed words</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <PaywallModal
        visible={paywallVisible}
        onDismiss={() => {
          AsyncStorage.setItem(GATE1_KEY, "1").catch(() => {});
          setPaywallVisible(false);
        }}
        reason="gate1"
      />

      <Modal
        visible={showMissedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMissedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Missed words</Text>
              <TouchableOpacity onPress={() => setShowMissedModal(false)}>
                <Feather name="x" size={20} color={T.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {MISSED_WORDS.length} word{MISSED_WORDS.length !== 1 ? "s" : ""} you didn't get right this session. Review and try to recall each one.
            </Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.missedGrid}>
                {MISSED_WORDS.map((word, i) => (
                  <View key={i} style={styles.missedChip}>
                    <Text style={styles.missedChipText}>{word}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowMissedModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 14, paddingTop: 8 },
  hintGradBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: T.primary + "1A",
    borderWidth: 1,
    borderColor: T.primary + "55",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hintGradBannerText: { flex: 1, fontSize: 13, color: T.text, fontWeight: "600" as const },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  sessionCompleteLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  scoreNumber: {
    fontSize: 80,
    fontWeight: "800" as const,
    letterSpacing: -2,
    lineHeight: 80,
    marginBottom: 8,
  },
  scoreSub: { fontSize: 14 },
  phaseAdvanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: T.correct + "12",
    borderWidth: 1.5,
    borderColor: T.correct + "44",
    borderRadius: 16,
    padding: 16,
  },
  phaseAdvanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.correct + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseAdvanceEmoji: { fontSize: 22 },
  phaseAdvanceTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: T.text,
    marginBottom: 4,
  },
  phaseAdvanceSub: { fontSize: 12, color: T.secondary, lineHeight: 18 },
  card: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  accuracyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 12,
  },
  accuracyDot: { width: 14, height: 14, borderRadius: 3 },
  legendRow: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: T.secondary },
  phaseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  phaseBadgeDot: { width: 5, height: 5, borderRadius: 3 },
  phaseBadgeText: { fontSize: 11, fontWeight: "600" as const },
  phasePercent: { fontSize: 11, color: T.tertiary },
  phaseBarTrack: {
    height: 8,
    backgroundColor: T.surface2,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  phaseBarFill: {
    height: "100%",
    backgroundColor: T.primary,
    borderRadius: 4,
  },
  phaseUnlockText: { fontSize: 12, color: T.tertiary },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  streakLabel: { fontSize: 11, color: T.tertiary, flex: 1 },
  streakDots: { flexDirection: "row", gap: 6 },
  streakDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  streakCountText: { fontSize: 11, fontWeight: "700" as const, minWidth: 28, textAlign: "right" },
  nextSessionCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextSessionLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  nextSessionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  nextSessionTitle: { fontSize: 13, fontWeight: "600" as const, color: T.text },
  nextSessionSub: { fontSize: 12, color: T.tertiary },
  nextSessionRight: { alignItems: "flex-end", flexShrink: 0, paddingLeft: 8 },
  nextSessionDay: { fontSize: 13, fontWeight: "600" as const, color: T.primary },
  nextSessionTime: { fontSize: 11, color: T.tertiary },
  session2Btn: {
    backgroundColor: T.hint,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  session2BtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  homeBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: T.border,
  },
  homeBtnSecondaryText: { color: T.secondary },
  homeBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  homeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  reviewBtn: { alignItems: "center", paddingVertical: 4 },
  reviewBtnText: { fontSize: 13, color: T.secondary, textDecorationLine: "underline" },
  ratingCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: T.text,
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 12,
    color: T.secondary,
    marginBottom: 16,
  },
  ratingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingBtn: {
    flex: 1,
    minWidth: "44%",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 3,
  },
  ratingBtnDisabled: { opacity: 0.5 },
  ratingBtnLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  ratingBtnDesc: {
    fontSize: 11,
    color: T.secondary,
  },
  flashCompleteContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  flashCompleteIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: T.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  flashCompleteEmoji: { fontSize: 36 },
  flashCompleteTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: T.text,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  flashCompleteSub: {
    fontSize: 15,
    color: T.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 17, fontWeight: "700" as const, color: T.text },
  modalSubtitle: { fontSize: 13, color: T.secondary, marginBottom: 16, lineHeight: 20 },
  modalScroll: { maxHeight: 280 },
  missedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  missedChip: {
    backgroundColor: T.wrong + "18",
    borderWidth: 1,
    borderColor: T.wrong + "44",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  missedChipText: {
    fontFamily: "Lora_400Regular",
    fontSize: 14,
    color: T.wrong,
    fontWeight: "600" as const,
  },
  modalCloseBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },
});
