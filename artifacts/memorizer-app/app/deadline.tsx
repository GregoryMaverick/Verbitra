import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { scheduleSessionNotification } from "@/hooks/useNotifications";
import { useHardAuthGate } from "@/hooks/useHardAuthGate";
import { triggerMnemonicGeneration, triggerAcronymGeneration } from "@/lib/api";
import {
  ALL_CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  classifyContent,
  isMnemonicSuitable,
  type ContentType,
} from "@/lib/contentClassifier";
import { getModeForDays as getStudyMode, type ChunkEntry } from "@/context/AppContext";
import { chunkText } from "@/lib/chunker";
import { useSubscription } from "@/lib/revenuecat";
import PaywallModal from "@/components/PaywallModal";

const GATE1_SESSION_THRESHOLD = 7;

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function buildCalendarWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getModeForDays(daysAway: number) {
  if (daysAway <= 3) return { key: "mnemonic", label: "Mnemonic Mode", color: T.wrong };
  if (daysAway <= 7) return { key: "intensive", label: "Intensive Mode", color: T.hint };
  if (daysAway <= 30) return { key: "standard", label: "Standard Mode", color: T.secondary };
  return { key: "spaced", label: "Spaced Mode", color: T.primary };
}

function getPhaseDays(totalDays: number, sessionsPerDay: number) {
  // Work in sessions, not days, so Intensive Mode (2/day) reflects the real pace.
  const totalSessions = totalDays * sessionsPerDay;

  const s1 = Math.max(1, Math.round(totalSessions * 0.15)); // read phase is short
  const s2 = Math.max(1, Math.round(totalSessions * 0.45));
  const s3 = totalSessions - s1 - s2;

  // Convert session counts back to a readable day label.
  const sessionToDay = (s: number) => Math.ceil(s / sessionsPerDay);
  const dayLabel = (startSession: number, endSession: number) => {
    const startDay = sessionToDay(startSession);
    const endDay   = sessionToDay(endSession);
    if (startDay === endDay) return startDay === 1 ? "Day 1" : `Day ${startDay}`;
    return `Days ${startDay}–${endDay}`;
  };

  const phases: { label: string; days: string }[] = [
    { label: "Read & listen",    days: dayLabel(1, s1) },
    { label: "Type from memory", days: dayLabel(s1 + 1, s1 + s2) },
  ];
  if (s3 > 0) {
    phases.push({ label: "Recall unaided", days: dayLabel(s1 + s2 + 1, totalSessions) });
  }
  return phases;
}

function makeTempId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function featherIconForContentType(ct: ContentType): React.ComponentProps<typeof Feather>["name"] {
  switch (ct) {
    case "ordered-list":
      return "list";
    case "definition":
      return "layers";
    case "dialogue":
      return "message-square";
    case "long-form":
      return "book-open";
    default:
      return "file-text";
  }
}

export default function DeadlineScreen() {
  const insets = useSafeAreaInsets();
  const { pendingText, pendingTitle, pendingUseChunks, setPendingTitle, setPendingDeadlineDate, addText, notificationSettings, setPendingTextId, sessions } = useApp();
  const { getValidToken } = useAuth();
  useHardAuthGate();
  const { isSubscribed } = useSubscription();
  const gate1Locked = !isSubscribed && sessions.length >= GATE1_SESSION_THRESHOLD;
  const [paywallVisible, setPaywallVisible] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const effectiveTitle = pendingTitle.trim() || pendingText.trim().slice(0, 40) || "Untitled";

  const detectedContentType = useMemo(() => classifyContent(pendingText), [pendingText]);
  const [contentTypeOverride, setContentTypeOverride] = useState<ContentType | null>(null);
  useEffect(() => {
    setContentTypeOverride(null);
  }, [pendingText]);

  const effectiveContentType = contentTypeOverride ?? detectedContentType;
  const isDialogue = effectiveContentType === "dialogue";
  const isOrderedList = effectiveContentType === "ordered-list";
  const [justMyLines, setJustMyLines] = useState(false);
  const [myCharacterName, setMyCharacterName] = useState("");

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const weeks = buildCalendarWeeks(viewYear, viewMonth);

  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const selectedDate = selectedDay
    ? new Date(viewYear, viewMonth, selectedDay)
    : null;

  const daysAway = selectedDate
    ? Math.ceil(
        (selectedDate.getTime() - today.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Session length is driven by text length, not deadline length.
  // Estimate ~1 minute per 12 words (typing + thinking time), capped at 5–30 min.
  const wordCount = useMemo(
    () => pendingText.trim().split(/\s+/).filter(Boolean).length,
    [pendingText]
  );
  const minsPerSession = Math.min(30, Math.max(5, Math.round(wordCount / 12)));
  const mode = daysAway ? getModeForDays(daysAway) : null;
  const isTightDeadline = daysAway != null && daysAway <= 2;
  const tightTotalSessions = 5;
  const sessionsPerDay = isTightDeadline
    ? Math.ceil(tightTotalSessions / Math.max(1, daysAway ?? 1))
    : mode?.key === "mnemonic"
    ? 3
    : mode?.key === "intensive"
    ? 2
    : 1;
  const totalSessions = isTightDeadline
    ? tightTotalSessions
    : (daysAway ?? 0) * sessionsPerDay;
  const phases = daysAway
    ? isTightDeadline
      ? getPhaseDays(Math.ceil(tightTotalSessions / sessionsPerDay), sessionsPerDay)
      : getPhaseDays(daysAway, sessionsPerDay)
    : null;

  const isToday = (day: number) =>
    day === todayDay && viewMonth === todayMonth && viewYear === todayYear;

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(todayYear, todayMonth, todayDay);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleStart = async () => {
    if (selectedDate) {
      setPendingDeadlineDate(selectedDate);

      if (notificationSettings.globalEnabled && daysAway !== null) {
        const nextSession = new Date();
        nextSession.setDate(nextSession.getDate() + 1);
        scheduleSessionNotification({
          textId: "pending_" + Date.now(),
          textTitle: "Your memorization session",
          deadlineDate: selectedDate,
          nextSessionAt: nextSession,
          daysLeft: daysAway,
          reminderHour: notificationSettings.reminderHour,
          reminderMinute: notificationSettings.reminderMinute,
        });
      }
    }

    const title = effectiveTitle;
    const isMnemonicMode = daysAway !== null && daysAway <= 3 && isMnemonicSuitable(effectiveContentType);

    const effectiveCharName = justMyLines && myCharacterName.trim() ? myCharacterName.trim() : null;

    let chunks: ChunkEntry[] | undefined;
    if (pendingUseChunks) {
      const rawChunks = chunkText(pendingText);
      if (rawChunks.length > 1) {
        chunks = rawChunks.map((content, index) => ({
          index,
          content,
          phase: 1,
          recallPct: 0,
          isUnlocked: index === 0,
          consecutiveGoodSessions: 0,
          sessionCountInPhase: 0,
        }));
      }
    }

    const entry = await addText({
      id: makeTempId(),
      title,
      content: pendingText,
      phase: 1,
      totalPhases: 3,
      recallPct: 0,
      phaseColor: "#818CF8",
      nextSessionTime: "",
      nextSessionLabel: "Today",
      daysLeft: daysAway ?? 0,
      deadlineDate: selectedDate?.toISOString(),
      updatedAt: new Date().toISOString(),
      notificationsEnabled: notificationSettings.globalEnabled,
      consecutiveGoodSessions: 0,
      sessionCountInPhase: 0,
      contentType: effectiveContentType,
      myCharacterName: effectiveCharName,
      mode: daysAway != null ? getStudyMode(daysAway) : undefined,
      isTightDeadline: daysAway != null && daysAway <= 2 ? true : undefined,
      chunks,
    });

    setPendingTitle("");

    const token = await getValidToken();

    if (isOrderedList && pendingText && !gate1Locked) {
      triggerAcronymGeneration(entry.id, pendingText, token).catch(() => {});
    }

    // Short deadlines (≤ 7 days): generate mnemonic scaffold for all suitable types.
    // Long deadlines (> 7 days): lists get an acronym (already triggered above) which is
    // the primary scaffold — skip generating a full mnemonic for passages/definitions.
    const isLongDeadline = (daysAway ?? 0) > 7;
    const shouldGenerateMnemonic =
      !gate1Locked &&
      isMnemonicSuitable(effectiveContentType) &&
      pendingText &&
      (!isLongDeadline || effectiveContentType === "ordered-list");

    if (shouldGenerateMnemonic) {
      triggerMnemonicGeneration(entry.id, pendingText, daysAway ?? 0, token, effectiveContentType).catch(() => {});
    }

    if (isMnemonicMode && pendingText) {
      setPendingTextId(entry.id);
      router.replace({ pathname: "/mnemonic", params: { textId: entry.id, daysLeft: String(daysAway) } });
    } else if (chunks && chunks.length > 0) {
      router.push({
        pathname: "/reading",
        params: { textId: entry.id, textTitle: entry.title, chunkIndex: "0" },
      });
    } else {
      router.push({
        pathname: "/reading",
        params: { textId: entry.id, textTitle: entry.title },
      });
    }
  };

  const todayStr = `${MONTH_NAMES[todayMonth].slice(0, 3)} ${todayDay}`;
  const selectedStr = selectedDate
    ? `${MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}`
    : null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          testID="deadline-back-btn"
        >
          <Feather name="arrow-left" size={22} color={T.secondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Set your deadline</Text>
          <Text style={styles.headerSubtitle}>When do you need to know this?</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthLabel}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Feather name="chevron-left" size={20} color={T.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Feather name="chevron-right" size={20} color={T.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarGrid}>
            {DAYS_OF_WEEK.map((d) => (
              <View key={d} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{d}</Text>
              </View>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                const selected = day !== null && day === selectedDay;
                const past = day !== null && isPast(day);
                const todayCurrent = day !== null && isToday(day);
                return (
                  <TouchableOpacity
                    key={`${wi}-${di}`}
                    style={[
                      styles.dayCell,
                      selected && { backgroundColor: T.primary },
                      todayCurrent &&
                        !selected && {
                          borderWidth: 1,
                          borderColor: T.primary + "66",
                        },
                    ]}
                    onPress={() => {
                      if (day && !past) setSelectedDay(day);
                    }}
                    disabled={!day || past}
                    activeOpacity={day && !past ? 0.7 : 1}
                    testID={day ? `deadline-day-${day}` : undefined}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !day && { opacity: 0 },
                        past && { color: T.tertiary, opacity: 0.5 },
                        selected && { color: "#fff", fontWeight: "700" as const },
                        todayCurrent && !selected && { color: T.primary },
                      ]}
                    >
                      {day ?? ""}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={styles.dateInfoRow}>
            <View style={styles.dateInfoDot} />
            <Text style={styles.dateInfoText}>
              Today is {todayStr}
              {selectedStr && daysAway !== null
                ? ` · ${selectedStr} is ${daysAway} day${daysAway === 1 ? "" : "s"} away`
                : " · Select a deadline date"}
            </Text>
          </View>
        </View>

        {daysAway !== null && daysAway > 0 && mode && phases && (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planHeaderLabel}>Your study plan</Text>
              <View
                style={[
                  styles.modeBadge,
                  { backgroundColor: mode.color + "1A", borderColor: mode.color + "44" },
                ]}
              >
                <View style={[styles.modeDot, { backgroundColor: mode.color }]} />
                <Text style={[styles.modeLabel, { color: mode.color }]}>
                  {mode.label}
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>{totalSessions}</Text>
                <Text style={styles.statPrimary}>sessions total</Text>
                <Text style={styles.statSub}>
                  {sessionsPerDay > 1 ? `${sessionsPerDay} per day` : "one per day"}
                </Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>{minsPerSession}</Text>
                <Text style={styles.statPrimary}>minutes each</Text>
                <Text style={styles.statSub}>per session</Text>
              </View>
            </View>

            {isTightDeadline && (
              <View style={styles.tightBanner}>
                <Feather name="zap" size={14} color={T.wrong} />
                <Text style={styles.tightBannerText}>
                  Tight deadline — best effort, but verbatim in {daysAway === 1 ? "1 day" : `${daysAway} days`} is hard.
                </Text>
              </View>
            )}

            <View style={styles.descBox}>
              {mode.key === "intensive" ? (
                <Text style={styles.descPrimary}>
                  2 sessions a day — morning and evening — to get through all 3 phases in under a week.
                </Text>
              ) : mode.key === "standard" ? (
                <Text style={styles.descPrimary}>
                  Spaced to match how memory fades — you'll practice right before you'd forget.
                </Text>
              ) : mode.key === "spaced" ? (
                <Text style={styles.descPrimary}>
                  Full 3-phase journey, then 7-day flash reviews to keep it sharp long-term.
                </Text>
              ) : (
                <>
                  <Text style={styles.descPrimary}>
                    1–3 sessions, maximum intensity — first-letter cues and progressive recall from day one.
                  </Text>
                  <Text style={styles.descSub}>
                    A memory scaffold is also generated to anchor the key structure.
                  </Text>
                </>
              )}
            </View>

            <View style={styles.phaseBarRow}>
              {phases.map((p, i) => (
                <View key={i} style={styles.phaseBarTrack}>
                  <View
                    style={[
                      styles.phaseBarFill,
                      { width: i === 0 ? "35%" : "0%" },
                    ]}
                  />
                </View>
              ))}
            </View>
            <View style={styles.phaseLabelRow}>
              {phases.map((p) => (
                <View key={p.label} style={{ flex: 1 }}>
                  <Text style={styles.phaseLabelText}>{p.label}</Text>
                  <Text style={styles.phaseDaysText}>{p.days}</Text>
                </View>
              ))}
            </View>

            <View style={styles.contentTypeBlock}>
              <View style={styles.contentTypeRow}>
                <Feather
                  name={featherIconForContentType(effectiveContentType)}
                  size={13}
                  color={T.tertiary}
                />
                <Text style={styles.contentTypeText}>
                  Detected: {CONTENT_TYPE_LABELS[detectedContentType].label}
                  {contentTypeOverride != null &&
                  contentTypeOverride !== detectedContentType ? (
                    <Text style={styles.contentTypeOverrideNote}>
                      {` · Using ${CONTENT_TYPE_LABELS[effectiveContentType].label}`}
                    </Text>
                  ) : null}
                </Text>
              </View>
              <Text style={styles.contentTypeChipsLabel}>Override type</Text>
              <View style={styles.contentTypeChips}>
                <TouchableOpacity
                  style={[
                    styles.typeChip,
                    contentTypeOverride === null && styles.typeChipActive,
                  ]}
                  onPress={() => setContentTypeOverride(null)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      contentTypeOverride === null && styles.typeChipTextActive,
                    ]}
                  >
                    Auto
                  </Text>
                </TouchableOpacity>
                {ALL_CONTENT_TYPES.map((ct) => (
                  <TouchableOpacity
                    key={ct}
                    style={[
                      styles.typeChip,
                      contentTypeOverride === ct && styles.typeChipActive,
                    ]}
                    onPress={() => setContentTypeOverride(ct)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        contentTypeOverride === ct && styles.typeChipTextActive,
                      ]}
                    >
                      {CONTENT_TYPE_LABELS[ct].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {isDialogue && (
              <View style={styles.justMyLinesSection}>
                <View style={styles.justMyLinesRow}>
                  <View style={styles.justMyLinesLeft}>
                    <Text style={styles.justMyLinesLabel}>Just My Lines</Text>
                    <Text style={styles.justMyLinesSub}>
                      Focus only on lines you need to memorise
                    </Text>
                  </View>
                  <Switch
                    value={justMyLines}
                    onValueChange={(v) => {
                      setJustMyLines(v);
                      if (!v) setMyCharacterName("");
                    }}
                    trackColor={{ false: T.border, true: T.primary + "88" }}
                    thumbColor={justMyLines ? T.primary : T.secondary}
                  />
                </View>
                {justMyLines && (
                  <View style={styles.charNameRow}>
                    <Text style={styles.charNameLabel}>Your character name</Text>
                    <TextInput
                      style={styles.charNameInput}
                      value={myCharacterName}
                      onChangeText={setMyCharacterName}
                      placeholder="e.g. HAMLET"
                      placeholderTextColor={T.tertiary}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                    <Text style={styles.charNameHint}>
                      Lines starting with this name will be the ones you type
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {gate1Locked && (
          <TouchableOpacity
            style={styles.gate1Banner}
            onPress={() => setPaywallVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="lock" size={15} color={T.primary} />
            <Text style={styles.gate1BannerText}>
              Upgrade to unlock AI memory devices — mnemonics & acronyms
            </Text>
            <Feather name="chevron-right" size={14} color={T.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.ctaBtn,
            (!selectedDay || !daysAway || daysAway <= 0) && styles.ctaBtnDisabled,
          ]}
          onPress={handleStart}
          disabled={!selectedDay || !daysAway || daysAway <= 0}
          activeOpacity={0.85}
          testID="deadline-start-btn"
        >
          <Text style={styles.ctaBtnText}>Start</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: T.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 12, color: T.tertiary, marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 14 },
  calendarCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthLabel: { fontSize: 15, fontWeight: "600" as const, color: T.text },
  monthNav: { flexDirection: "row", gap: 4 },
  navBtn: { padding: 6 },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeaderCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 4,
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: T.tertiary,
    letterSpacing: 0.5,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 2,
  },
  dayText: { fontSize: 13, color: T.text },
  dateInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: T.surface2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dateInfoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.tertiary,
  },
  dateInfoText: { fontSize: 11, color: T.tertiary, flex: 1 },
  planCard: {
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.primary + "44",
    borderRadius: 16,
    padding: 18,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  planHeaderLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeDot: { width: 5, height: 5, borderRadius: 3 },
  modeLabel: { fontSize: 11, fontWeight: "600" as const },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statTile: {
    flex: 1,
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: T.text,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  statPrimary: { fontSize: 12, color: T.secondary, marginTop: 3 },
  statSub: { fontSize: 11, color: T.tertiary, marginTop: 1 },
  tightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.wrong + "12",
    borderColor: T.wrong + "44",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  tightBannerText: {
    color: T.wrong,
    fontSize: 12,
    fontWeight: "600" as const,
    flex: 1,
  },
  descBox: {
    backgroundColor: T.primary + "12",
    borderWidth: 1,
    borderColor: T.primary + "33",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  descPrimary: {
    fontSize: 13,
    color: T.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  descSub: { fontSize: 12, color: T.secondary },
  phaseBarRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  phaseBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  phaseBarFill: {
    height: "100%",
    backgroundColor: T.primary,
    borderRadius: 3,
  },
  phaseLabelRow: { flexDirection: "row", gap: 4, marginBottom: 14 },
  phaseLabelText: { fontSize: 10, fontWeight: "600" as const, color: T.secondary },
  phaseDaysText: { fontSize: 10, color: T.tertiary },
  contentTypeBlock: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  contentTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  contentTypeText: { fontSize: 11, color: T.tertiary, flex: 1 },
  contentTypeOverrideNote: { fontSize: 11, color: T.primary, fontWeight: "600" as const },
  contentTypeChipsLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: T.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  contentTypeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surface2,
  },
  typeChipActive: {
    borderColor: T.primary,
    backgroundColor: T.primary + "18",
  },
  typeChipText: { fontSize: 11, color: T.secondary, fontWeight: "500" as const },
  typeChipTextActive: { color: T.primary, fontWeight: "700" as const },
  justMyLinesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  justMyLinesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  justMyLinesLeft: { flex: 1, marginRight: 12 },
  justMyLinesLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: T.text,
    marginBottom: 2,
  },
  justMyLinesSub: { fontSize: 12, color: T.secondary },
  charNameRow: {
    marginTop: 12,
    gap: 6,
  },
  charNameLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: T.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  charNameInput: {
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.primary + "55",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: T.text,
    fontWeight: "600" as const,
  },
  charNameHint: { fontSize: 11, color: T.tertiary },
  ctaBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnDisabled: { opacity: 0.4 },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  gate1Banner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: `${T.primary}18`,
    borderWidth: 1,
    borderColor: `${T.primary}40`,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  gate1BannerText: {
    flex: 1,
    color: T.primary,
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
});
