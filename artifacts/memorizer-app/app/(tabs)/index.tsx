import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { T, fontFamilies } from "@/constants/tokens";
import { useApp, TextEntry, ContentType, ChunkEntry } from "@/context/AppContext";
import { useAuth } from "@/lib/auth";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { isMnemonicSuitable } from "@/lib/contentClassifier";
import { useSubscription } from "@/lib/revenuecat";
import PaywallModal from "@/components/PaywallModal";
import { getNextSessionInfo } from "@/lib/nextSession";

const FREE_TEXT_LIMIT = 3;

const CONTENT_TYPE_META: Record<
  ContentType,
  { label: string; icon: "list" | "layers" | "message-square" | "book-open" | "file-text" }
> = {
  "ordered-list": { label: "List",        icon: "list" },
  "definition":   { label: "Definitions", icon: "layers" },
  "dialogue":     { label: "Dialogue",    icon: "message-square" },
  "long-form":    { label: "Long form",   icon: "book-open" },
  "passage":      { label: "Passage",     icon: "file-text" },
};

function getDynamicDaysLeft(item: TextEntry): number {
  if (item.deadlineDate) {
    const deadline = new Date(item.deadlineDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
  return item.daysLeft;
}

function getReviewLabel(nextReviewDue: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(nextReviewDue);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return `In ${diff} days`;
  const weeks = Math.round(diff / 7);
  if (diff < 30) return `In ${weeks} week${weeks === 1 ? "" : "s"}`;
  const months = Math.round(diff / 30);
  return `In ${months} month${months === 1 ? "" : "s"}`;
}

const DEMO_DISMISSED_KEY = "@memorizer:demoDismissed";

function PhaseStep({ current, total, color, consecutiveGoodSessions, sessionCountInPhase }: {
  current: number;
  total: number;
  color: string;
  consecutiveGoodSessions: number;
  sessionCountInPhase: number;
}) {
  const isMastered = current > total;
  const streakRequired = current >= 3 ? 3 : 2;

  if (isMastered) {
    return (
      <View style={styles.masteredBadge}>
        <Feather name="check-circle" size={12} color={T.correct} />
        <Text style={[styles.masteredText, { color: T.correct }]}>Mastered</Text>
      </View>
    );
  }
  return (
    <View style={styles.phaseStepCol}>
      <View style={styles.phaseStepRow}>
        <View style={styles.phaseStepDots}>
          {[...Array(total)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.phaseDot,
                {
                  width: i < current ? 20 : 14,
                  backgroundColor: i < current ? color : T.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.phaseLabel, { color }]}>
          Phase {current} of {total}
        </Text>
      </View>
      {sessionCountInPhase > 0 && (
        <View style={styles.streakMiniRow}>
          {[...Array(streakRequired)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.streakMiniDot,
                { backgroundColor: i < consecutiveGoodSessions ? T.correct : T.border },
              ]}
            />
          ))}
          <Text style={styles.streakMiniLabel}>
            {consecutiveGoodSessions}/{streakRequired} sessions
          </Text>
        </View>
      )}
    </View>
  );
}

function ChunkStrip({ chunks }: { chunks: ChunkEntry[] }) {
  const total = chunks.length;
  const mastered = chunks.filter((c) => c.phase > 3).length;
  const unlocked = chunks.filter((c) => c.isUnlocked).length;
  const activeChunk = chunks.find((c) => c.isUnlocked && c.phase <= 3);
  const allMastered = mastered === total;

  return (
    <View style={styles.chunkStripContainer}>
      <View style={styles.chunkStripDots}>
        {chunks.map((c) => {
          const isMastered = c.phase > 3;
          const isActive = c.isUnlocked && c.phase <= 3 && c.index === activeChunk?.index;
          const isLocked = !c.isUnlocked;
          return (
            <View
              key={c.index}
              style={[
                styles.chunkDot,
                isMastered && { backgroundColor: T.correct },
                isActive && { backgroundColor: T.primary },
                isLocked && { backgroundColor: T.border },
                !isMastered && !isActive && !isLocked && { backgroundColor: T.hint + "88" },
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.chunkStripLabel}>
        {allMastered
          ? "All chunks mastered · Full run available"
          : activeChunk
          ? `Chunk ${activeChunk.index + 1}/${total} · Phase ${activeChunk.phase}`
          : `${mastered}/${total} chunks mastered`}
      </Text>
    </View>
  );
}

function TextCard({ item, onPress, onLongPress, onDelete, isNew, sessionsToday }: { item: TextEntry; onPress: () => void; onLongPress: () => void; onDelete: () => void; isNew: boolean; sessionsToday: number }) {
  const daysLeft = getDynamicDaysLeft(item);
  const isOverdue = daysLeft <= 0;
  const daysLeftColor = isOverdue ? T.wrong : daysLeft <= 3 ? T.wrong : daysLeft <= 7 ? T.hint : T.text;
  const contentType = item.contentType ?? "passage";
  const ctMeta = CONTENT_TYPE_META[contentType];
  const isMastered = item.phase > item.totalPhases;
  const reviewLabel = isMastered && item.nextReviewDue ? getReviewLabel(item.nextReviewDue) : null;
  const nextSession = getNextSessionInfo(item, sessionsToday, false);
  return (
    <TouchableOpacity
      style={styles.textCard}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.75}
    >
      <View style={styles.cardTitleRow}>
        <Text style={[styles.cardTitle, { flex: 1 }]} numberOfLines={2}>
          {item.title}
        </Text>
        {contentType !== "passage" && (
          <View style={styles.contentTypeBadge}>
            <Feather name={ctMeta.icon} size={12} color={T.tertiary} />
            <Text style={styles.contentTypeBadgeText}>{ctMeta.label}</Text>
          </View>
        )}
        {isMnemonicSuitable(contentType) && item.phase >= 2 && (
          <TouchableOpacity
            onPress={(e) => {
              // Prevent the parent card tap (open text) from firing.
              // On web, nested touchables can bubble to the parent.
              (e as any)?.stopPropagation?.();
              router.push({ pathname: "/mnemonic", params: { textId: item.id, daysLeft: "0", readOnly: "true" } });
            }}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
            style={styles.cardMnemonicBtn}
          >
            <Feather name="star" size={15} color={T.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={(e) => {
            // Prevent the parent card tap (open text) from firing.
            (e as any)?.stopPropagation?.();
            onDelete();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 4, right: 12 }}
          style={styles.cardDeleteBtn}
        >
          <Feather name="trash-2" size={16} color={T.tertiary} />
        </TouchableOpacity>
      </View>

      {item.chunks && item.chunks.length > 0 ? (
        <View style={styles.cardMidRow}>
          <ChunkStrip chunks={item.chunks} />
        </View>
      ) : (
        <View style={styles.cardMidRow}>
          <PhaseStep
            current={item.phase}
            total={item.totalPhases}
            color={item.phaseColor}
            consecutiveGoodSessions={item.consecutiveGoodSessions ?? 0}
            sessionCountInPhase={item.sessionCountInPhase ?? 0}
          />
          <View style={styles.cardRecallBox}>
            {isNew ? (
              <>
                <Text style={[styles.recallPct, { color: T.tertiary, fontSize: 14 }]}>
                  New
                </Text>
                <Text style={styles.recallLabel}>not started yet</Text>
              </>
            ) : (
              <>
                <Text style={[styles.recallPct, { color: item.phaseColor }]}>
                  {item.recallPct}%
                </Text>
                <Text style={styles.recallLabel}>recalled last time</Text>
              </>
            )}
          </View>
        </View>
      )}

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View>
          {reviewLabel ? (
            <>
              <Text style={styles.nextSessionLabel}>Next review</Text>
              <Text style={styles.nextSessionTime}>{reviewLabel}</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextSessionLabel}>Next session</Text>
              <Text style={styles.nextSessionTime}>
                <Text style={nextSession.isToday ? { color: T.hint } : undefined}>
                  {nextSession.label}
                </Text>
                {nextSession.sub ? (
                  <Text style={{ color: T.secondary, fontWeight: "400" as const }}>
                    {" · "}{nextSession.sub}
                  </Text>
                ) : null}
              </Text>
            </>
          )}
        </View>
        <View style={[styles.daysLeftPill, { backgroundColor: daysLeftColor + "18", borderColor: daysLeftColor + "44" }]}>
          <Text style={[styles.daysLeftText, { color: daysLeftColor }]}>
            {isOverdue ? "Overdue" : `${daysLeft}d left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DemoCard({ onStart, onDismiss }: { onStart: () => void; onDismiss: () => void }) {
  return (
    <View style={styles.demoCard}>
      <View style={styles.demoHeaderRow}>
        <View style={styles.demoIconBox}>
          <Ionicons name="sparkles" size={16} color={T.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.demoTitle}>Try a demo — Miranda rights</Text>
          <Text style={styles.demoSubtitle}>67 words · ~5 min to try</Text>
        </View>
      </View>
      <Text style={styles.demoText}>
        "You have the right to remain silent. Anything you say can and will be
        used against you in a court of law..."
      </Text>
      <View style={styles.demoActions}>
        <TouchableOpacity style={styles.demoStartBtn} onPress={onStart} activeOpacity={0.8}>
          <Text style={styles.demoStartBtnText}>Start demo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.demoDismissBtn} onPress={onDismiss} activeOpacity={0.7}>
          <Text style={styles.demoDismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReviewCard({ item, isFlash }: { item: TextEntry; isFlash?: boolean }) {
  const handlePress = () => {
    router.push({
      pathname: "/practice",
      params: {
        textId: item.id,
        textTitle: item.title,
        isReview: isFlash ? "false" : "true",
        isFlash: isFlash ? "true" : "false",
      },
    });
  };
  const accentColor = isFlash ? T.primary : T.correct;
  const contentType = item.contentType ?? "passage";
  const ctMeta = CONTENT_TYPE_META[contentType];
  return (
    <TouchableOpacity
      style={[styles.reviewCard, { borderColor: accentColor + "44", backgroundColor: accentColor + "08" }]}
      onPress={handlePress}
      activeOpacity={0.78}
    >
      <View style={styles.reviewCardLeft}>
        <View style={[styles.reviewCardIcon, { backgroundColor: accentColor + "1A" }]}>
          <Feather name={isFlash ? "zap" : "rotate-ccw"} size={14} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewCardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.reviewCardSub, { color: accentColor }]}>
            {isFlash
              ? "Flash recall · rapid-fire"
              : item.nextReviewDue
                ? `Due ${new Date(item.nextReviewDue).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                : "Spaced review due"}
          </Text>
        </View>
        {contentType !== "passage" && (
          <View style={[styles.contentTypeBadge, { marginTop: 0 }]}>
            <Feather name={ctMeta.icon} size={10} color={T.tertiary} />
            <Text style={styles.contentTypeBadgeText}>{ctMeta.label}</Text>
          </View>
        )}
      </View>
      <View style={[styles.reviewCardBtn, { backgroundColor: accentColor }]}>
        <Text style={styles.reviewCardBtnText}>{isFlash ? "Flash" : "Review"}</Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Feather name="file-text" size={28} color={T.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>No texts yet</Text>
      <Text style={styles.emptySubtitle}>
        Paste any text, set a deadline, and start learning it word for word.
      </Text>
      <TouchableOpacity style={styles.emptyAddBtn} onPress={onAdd} activeOpacity={0.8}>
        <Text style={styles.emptyAddBtnText}>Add your first text</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { texts, sessions, notificationSettings, deleteText, updateText, getActiveChunk } = useApp();
  const { isAuthenticated } = useAuth();
  const { isSubscribed } = useSubscription();
  const [showDemo, setShowDemo] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [showTextLimitPaywall, setShowTextLimitPaywall] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = new Date().toISOString().slice(0, 10);

  const reviewDue = texts.filter((t) => {
    if (t.phase <= t.totalPhases) return false;
    if (!t.nextReviewDue) return false;
    return new Date(t.nextReviewDue) <= today;
  });

  const flashDue = texts.filter((t) => {
    if (t.phase <= t.totalPhases) return false;
    if (t.mode !== "spaced") return false;
    if (!t.lastFlashDate) return true;
    const last = new Date(t.lastFlashDate);
    const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  });

  // Load persisted demo-dismissed flag on mount
  useEffect(() => {
    AsyncStorage.getItem(DEMO_DISMISSED_KEY).then((val) => {
      if (val !== "true") setShowDemo(true);
    }).catch(() => setShowDemo(true));
  }, []);

  useEffect(() => {
    if (
      texts.length > 0 &&
      !notificationSettings.permissionAsked &&
      !notificationSettings.globalEnabled &&
      Platform.OS !== "web"
    ) {
      const timer = setTimeout(() => setShowNotifPrompt(true), 800);
      return () => clearTimeout(timer);
    }
  }, [texts.length, notificationSettings.permissionAsked, notificationSettings.globalEnabled]);

  const handleTextPress = (item: TextEntry) => {
    if (item.chunks && item.chunks.length > 0) {
      const allMastered = item.chunks.every((c) => c.phase > 3);
      if (allMastered) {
        router.push({
          pathname: "/practice",
          params: { textId: item.id, textTitle: item.title, isFullRun: "true" },
        });
        return;
      }
      const activeChunk = getActiveChunk(item.id);
      if (activeChunk) {
        if (activeChunk.phase === 1) {
          router.push({
            pathname: "/reading",
            params: { textId: item.id, textTitle: item.title, chunkIndex: String(activeChunk.index) },
          });
        } else {
          router.push({
            pathname: "/practice",
            params: { textId: item.id, textTitle: item.title, chunkIndex: String(activeChunk.index) },
          });
        }
        return;
      }
    }
    if (item.phase === 1) {
      router.push({
        pathname: "/reading",
        params: { textId: item.id, textTitle: item.title },
      });
    } else {
      router.push({
        pathname: "/practice",
        params: { textId: item.id, textTitle: item.title },
      });
    }
  };

  const handleDismissDemo = () => {
    setShowDemo(false);
    AsyncStorage.setItem(DEMO_DISMISSED_KEY, "true").catch(() => {});
  };

  const handleDemoStart = () => {
    router.push({
      pathname: "/practice",
      params: { textId: "demo", textTitle: "Miranda Rights" },
    });
  };

  const handleTextLongPress = (item: TextEntry) => {
    const buttons: Parameters<typeof Alert.alert>[2] = [
      ...(Platform.OS === "ios"
        ? [
            {
              text: "Rename",
              onPress: () => {
                const iosAlert = Alert as typeof Alert & {
                  prompt(
                    title: string,
                    message?: string,
                    callback?: (text: string) => void,
                    type?: string,
                    defaultValue?: string
                  ): void;
                };
                iosAlert.prompt(
                  "Rename text",
                  "Enter a new name for this text.",
                  (newTitle: string) => {
                    if (newTitle && newTitle.trim().length > 0) {
                      updateText(item.id, { title: newTitle.trim() });
                    }
                  },
                  "plain-text",
                  item.title
                );
              },
            },
          ]
        : []),
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (Platform.OS === "web") {
            // RN Alert is unreliable on web; use the browser confirm dialog.
            const ok = window.confirm("Delete this text?\n\nThis cannot be undone.");
            if (ok) void deleteText(item.id);
            return;
          }
          Alert.alert("Delete this text?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteText(item.id) },
          ]);
        },
      },
      { text: "Cancel", style: "cancel" },
    ];
    Alert.alert(item.title, "What would you like to do?", buttons);
  };

  const handleAdd = () => {
    if (!isSubscribed && texts.length >= FREE_TEXT_LIMIT) {
      setShowTextLimitPaywall(true);
      return;
    }
    router.push("/input");
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Verbitra</Text>
          <Text style={styles.headerTitle}>Your texts</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          activeOpacity={0.8}
          testID="home-add-btn"
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {showDemo && (
          <DemoCard
            onStart={handleDemoStart}
            onDismiss={handleDismissDemo}
          />
        )}

        {reviewDue.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Due for review · {reviewDue.length}</Text>
            {reviewDue.map((item) => (
              <ReviewCard key={item.id} item={item} />
            ))}
          </>
        )}

        {flashDue.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Flash recall due · {flashDue.length}</Text>
            {flashDue.map((item) => (
              <ReviewCard key={item.id} item={item} isFlash />
            ))}
          </>
        )}

        {texts.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <>
            <Text style={styles.sectionLabel}>All texts · {texts.length}</Text>
            {texts.map((item) => (
              <TextCard
                key={item.id}
                item={item}
                onPress={() => handleTextPress(item)}
                onLongPress={() => handleTextLongPress(item)}
                onDelete={() => {
                  if (Platform.OS === "web") {
                    const ok = window.confirm("Delete this text?\n\nThis cannot be undone.");
                    if (ok) void deleteText(item.id);
                    return;
                  }
                  Alert.alert("Delete this text?", "This cannot be undone.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteText(item.id) },
                  ]);
                }}
                isNew={!sessions.some((s) => s.textId === item.id)}
                sessionsToday={sessions.filter((s) => s.textId === item.id && s.completedAt.startsWith(todayStr)).length}
              />
            ))}
          </>
        )}
      </ScrollView>

      <NotificationPermissionPrompt
        visible={showNotifPrompt}
        onDismiss={() => setShowNotifPrompt(false)}
      />

      <PaywallModal
        visible={showTextLimitPaywall}
        onDismiss={() => setShowTextLimitPaywall(false)}
        reason="generic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    color: T.primary,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: T.text,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  demoCard: {
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.primary + "55",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  demoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  demoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.primary + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: T.text,
    marginBottom: 2,
  },
  demoSubtitle: { fontSize: 13, color: T.tertiary },
  demoText: {
    fontSize: 13,
    color: T.secondary,
    lineHeight: 20,
    padding: 12,
    backgroundColor: T.surface2,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: T.primary,
    marginBottom: 12,
    fontFamily: "Lora_400Regular",
  },
  demoActions: { flexDirection: "row", gap: 8 },
  demoStartBtn: {
    flex: 1,
    backgroundColor: T.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  demoStartBtnText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 13,
  },
  demoDismissBtn: {
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  demoDismissText: { color: T.secondary, fontSize: 13 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  textCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: T.text,
    lineHeight: 22,
  },
  contentTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    flexShrink: 0,
  },
  contentTypeBadgeText: {
    fontSize: 11,
    color: T.tertiary,
    fontWeight: "500" as const,
  },
  cardMidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  masteredBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  masteredText: { fontSize: 12, fontWeight: "600" as const },
  phaseStepCol: { flexDirection: "column", gap: 4 },
  phaseStepRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  phaseStepDots: { flexDirection: "row", gap: 3 },
  phaseDot: { height: 5, borderRadius: 3 },
  phaseLabel: { fontSize: 13, fontWeight: "600" as const },
  streakMiniRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakMiniDot: { width: 7, height: 7, borderRadius: 4 },
  streakMiniLabel: { fontSize: 11, color: T.tertiary },
  cardRecallBox: { alignItems: "flex-end" },
  recallPct: { fontSize: 20, fontWeight: "700" as const, lineHeight: 22 },
  recallLabel: { fontSize: 12, color: T.tertiary, marginTop: 1 },
  cardDeleteBtn: { padding: 8, marginLeft: 18 },
  cardMnemonicBtn: { padding: 8, marginLeft: 6 },
  mnemonicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 2,
    minHeight: 44,
    marginTop: 4,
    marginBottom: 4,
  },
  mnemonicRowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: T.primary,
  },
  cardDivider: { height: 1, backgroundColor: T.border, marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextSessionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: T.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  nextSessionTime: { fontSize: 15, fontWeight: "600" as const, color: T.text },
  daysLeftPill: {
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
  },
  daysLeftText: { fontSize: 12, color: T.tertiary },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: T.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: T.secondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyAddBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  emptyAddBtnText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  reviewCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  reviewCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: T.text,
    marginBottom: 2,
  },
  reviewCardSub: {
    fontSize: 11,
    fontWeight: "500" as const,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  reviewCardBtn: {
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 0,
  },
  reviewCardBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  chunkStripContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    marginBottom: 4,
  },
  chunkStripDots: { flexDirection: "row", gap: 4 },
  chunkDot: {
    width: 14,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.border,
  },
  chunkStripLabel: { fontSize: 11, color: T.tertiary, flex: 1 },
});
