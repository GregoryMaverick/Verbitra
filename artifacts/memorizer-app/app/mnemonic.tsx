import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T, fontFamilies } from "@/constants/tokens";
import { fetchMnemonic, triggerMnemonicGeneration, type MnemonicResponse } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useHardAuthGate } from "@/hooks/useHardAuthGate";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

export default function MnemonicScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ textId: string; daysLeft: string; readOnly?: string }>();
  const { pendingText, texts } = useApp();
  const { getValidToken } = useAuth();
  useHardAuthGate();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const textId = params.textId ?? "";
  const daysLeft = Number(params.daysLeft ?? "1");
  const isReadOnly = params.readOnly === "true";

  const [mnemonic, setMnemonic] = useState<MnemonicResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textExpanded, setTextExpanded] = useState(false);
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = async (token: string | null) => {
    if (!textId) {
      setStatus("error");
      setErrorMsg("No text ID provided.");
      return;
    }

    try {
      const result = await fetchMnemonic(textId, token);
      if (result.status === "ready") {
        setMnemonic(result);
        setStatus("ready");
      } else if (result.status === "error") {
        setStatus("error");
        setErrorMsg(result.errorMessage ?? "Generation failed.");
      } else {
        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setStatus("error");
          setErrorMsg("Generation timed out. Please try again.");
          return;
        }
        pollTimer.current = setTimeout(() => poll(token), POLL_INTERVAL_MS);
      }
    } catch (err) {
      const msg = (err as Error).message ?? "";
      if (msg.includes("API base URL not configured")) {
        setStatus("error");
        setErrorMsg(msg);
        return;
      }
      if (msg.includes("404") || msg.includes("not found")) {
        // No mnemonic yet — try to generate one from stored text if available.
        const storedEntry = texts.find((t) => t.id === textId);
        const storedContent = storedEntry?.content;
        if (storedContent) {
          // Fire-and-forget generation, then keep polling for the result.
          triggerMnemonicGeneration(textId, storedContent, 0, token).catch(() => {});
          pollCount.current += 1;
          if (pollCount.current >= MAX_POLLS) {
            setStatus("error");
            setErrorMsg("Generation timed out. Tap retry to try again.");
            return;
          }
          pollTimer.current = setTimeout(() => poll(token), POLL_INTERVAL_MS);
        } else {
          setStatus("error");
          setErrorMsg("No memory device found for this text.");
        }
        return;
      } else if (msg.includes("401") || msg.includes("Unauthorized") || msg.includes("403") || msg.includes("Forbidden")) {
        setStatus("error");
        setErrorMsg("Session expired. Please go back and try again.");
      } else {
        setStatus("error");
        setErrorMsg("Server unreachable. Check your connection and tap retry.");
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    getValidToken()
      .then((token) => { if (!cancelled) poll(token); })
      .catch(() => { if (!cancelled) poll(null); });
    return () => {
      cancelled = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [textId]);

  const handleRetry = () => {
    setStatus("loading");
    setErrorMsg(null);
    pollCount.current = 0;
    getValidToken().then((token) => {
      if (pendingText && textId) {
        triggerMnemonicGeneration(textId, pendingText, daysLeft, token).catch(() => {});
      }
      setTimeout(() => poll(token), 1000);
    }).catch(() => {
      if (pendingText && textId) {
        triggerMnemonicGeneration(textId, pendingText, daysLeft, null).catch(() => {});
      }
      setTimeout(() => poll(null), 1000);
    });
  };

  const currentEntry = texts.find((t) => t.id === textId);
  const textTitle = currentEntry?.title ?? "Your text";
  const entryContent = currentEntry?.content ?? "";
  const currentPhase = currentEntry?.phase ?? 1;

  const routeToPhaseActivity = () => {
    if (currentPhase <= 1) {
      router.push({ pathname: "/reading", params: { textId, textTitle } });
    } else {
      router.push({ pathname: "/practice", params: { textId, textTitle } });
    }
  };

  const handleStartSession = () => {
    routeToPhaseActivity();
  };

  const handleSkip = () => {
    routeToPhaseActivity();
  };

  const TECHNIQUE_META: Record<string, { color: string; icon: string; label: string }> = {
    Acronym:      { color: T.primary, icon: "hash",         label: "Acronym" },
    Acrostic:     { color: T.primary, icon: "type",         label: "Acrostic" },
    Rhyme:        { color: T.hint,    icon: "music",        label: "Rhyme" },
    Story:        { color: T.correct, icon: "book-open",    label: "Story" },
    KeywordChain: { color: T.correct, icon: "link",         label: "Keyword Chain" },
    Scene:        { color: T.correct, icon: "film",         label: "Scene Anchor" },
    Association:  { color: T.correct, icon: "book-open",   label: "Association" },
  };

  const parseMnemonicContent = (content: string) => {
    const lines = content.split("\n");
    const title = lines[0]?.trim() ?? "";
    const usageTipLineIdx = lines.findIndex((l) => l.trimStart().startsWith("How to use:"));
    const usageTip = usageTipLineIdx >= 0
      ? lines[usageTipLineIdx]!.replace(/^How to use:\s*/i, "").trim()
      : "";
    const bodyLines = lines.slice(1, usageTipLineIdx >= 0 ? usageTipLineIdx : undefined);
    const body = bodyLines.join("\n").trim();
    return { title, body, usageTip };
  };

  const renderMnemonicContent = () => {
    if (!mnemonic) return null;
    const { title, body, usageTip } = parseMnemonicContent(mnemonic.content);
    const techniqueKey = (mnemonic.mnemonicType ?? "").trim();
    const technique = TECHNIQUE_META[techniqueKey] ?? { color: T.secondary, icon: "star", label: techniqueKey || "Memory Device" };

    return (
      <View style={styles.mnemonicCard}>
        <View style={styles.cardTopRow}>
          <View style={[styles.techniqueBadge, { backgroundColor: technique.color + "1A", borderColor: technique.color + "44" }]}>
            <Feather name={technique.icon as "hash"} size={11} color={technique.color} />
            <Text style={[styles.techniqueBadgeText, { color: technique.color }]}>{technique.label}</Text>
          </View>
          <View style={styles.aiBadge}>
            <View style={styles.aiBadgeDot} />
            <Text style={styles.aiBadgeText}>AI generated</Text>
          </View>
        </View>

        <Text style={styles.mnemonicTitle}>{title}</Text>

        <Text style={styles.mnemonicBody}>{body}</Text>

        {usageTip ? (
          <View style={styles.usageTipBox}>
            <Feather name="arrow-right-circle" size={13} color={technique.color} style={{ marginTop: 1 }} />
            <Text style={[styles.usageTipText, { color: technique.color }]}>{usageTip}</Text>
          </View>
        ) : (
          <View style={styles.mnemonicFooter}>
            <Text style={styles.mnemonicFooterText}>
              Read this carefully. Then close your eyes and try to recall the anchor. Your first session will build on this.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.mnemonicCard}>
      <View style={[styles.cardTopRow, { marginBottom: 14 }]}>
        <View style={[styles.skeletonLine, { width: 80, height: 22, borderRadius: 6 }]} />
        <View style={[styles.skeletonLine, { width: 80, height: 22, borderRadius: 6 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: "55%", height: 20, marginBottom: 16 }]} />
      <View style={[styles.skeletonLine, { width: "100%", height: 12, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: "95%", height: 12, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: "85%", height: 12, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: "90%", height: 12, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: "75%", height: 12, marginBottom: 20 }]} />
      <View style={styles.skeletonFooter}>
        <ActivityIndicator size="small" color={T.primary} />
        <Text style={styles.generatingText}>Generating your memory device…</Text>
      </View>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorCard}>
      <Feather name="alert-circle" size={28} color={T.wrong} style={{ marginBottom: 12 }} />
      <Text style={styles.errorTitle}>Mnemonic unavailable</Text>
      <Text style={styles.errorBody}>{errorMsg ?? "Something went wrong."}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} testID="mnemonic-retry-btn">
        <Feather name="refresh-cw" size={14} color={T.primary} />
        <Text style={styles.retryBtnText}>Tap to retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={18} color={T.secondary} />
        </TouchableOpacity>
        {isReadOnly ? (
          <View style={[styles.modeBadge, { backgroundColor: T.primary + "15", borderColor: T.primary + "33" }]}>
            <View style={[styles.modeDot, { backgroundColor: T.primary }]} />
            <Text style={[styles.modeLabel, { color: T.primary }]}>Memory Device</Text>
          </View>
        ) : (
          <View style={styles.modeBadge}>
            <View style={styles.modeDot} />
            <Text style={styles.modeLabel}>Mnemonic Mode</Text>
          </View>
        )}
        {!isReadOnly && (
          <View style={styles.daysLeftBadge}>
            <Text style={styles.daysLeftText}>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</Text>
          </View>
        )}
        {isReadOnly && <View style={{ width: 40 }} />}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingBlock}>
          <Text style={styles.headingTitle}>Your memory device</Text>
          <Text style={styles.headingSubtitle}>
            {isReadOnly
              ? "Refer back to this any time — it's your anchor for remembering the structure of this text."
              : `With ${daysLeft} day${daysLeft !== 1 ? "s" : ""} to go, we've generated a memory anchor to help you encode the key structure before your first practice session.`}
          </Text>
        </View>

        {status === "loading" && renderSkeleton()}
        {status === "ready" && renderMnemonicContent()}
        {status === "error" && renderError()}

        {entryContent.length > 0 && (
          <View style={styles.textRefSection}>
            <TouchableOpacity
              style={styles.textRefToggle}
              onPress={() => setTextExpanded(e => !e)}
              activeOpacity={0.7}
            >
              <Feather name="file-text" size={14} color={T.secondary} />
              <Text style={styles.textRefToggleLabel}>Full text reference</Text>
              <Feather name={textExpanded ? "chevron-up" : "chevron-down"} size={14} color={T.tertiary} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
            {textExpanded && (
              <View style={styles.textRefBody}>
                <Text style={styles.textRefContent}>{entryContent}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.ctaRow, { paddingBottom: bottomPad + 8 }]}>
        {isReadOnly ? (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
            testID="mnemonic-done-btn"
          >
            <Text style={styles.startBtnText}>Got it — go back</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.startBtn, status !== "ready" && styles.startBtnDisabled]}
              onPress={handleStartSession}
              disabled={status !== "ready"}
              activeOpacity={0.85}
              testID="mnemonic-start-btn"
            >
              <Text style={styles.startBtnText}>I've read this — start session</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} testID="mnemonic-skip-btn">
              <Text style={styles.skipBtnText}>Skip mnemonic</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: { padding: 4 },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.wrong + "15",
    borderWidth: 1,
    borderColor: T.wrong + "33",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.wrong },
  modeLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.wrong,
    letterSpacing: 0.5,
  },
  daysLeftBadge: {
    backgroundColor: T.wrong + "22",
    borderWidth: 1,
    borderColor: T.wrong + "44",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  daysLeftText: { fontSize: 11, fontWeight: "700" as const, color: T.wrong },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 16 },
  headingBlock: { marginTop: 8, marginBottom: 4 },
  headingTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: T.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headingSubtitle: {
    fontSize: 13,
    color: T.secondary,
    lineHeight: 20,
  },
  mnemonicCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 20,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  techniqueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  techniqueBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.primary + "22",
    borderWidth: 1,
    borderColor: T.primary + "44",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiBadgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.primary },
  aiBadgeText: { fontSize: 10, fontWeight: "700" as const, color: T.primary },
  mnemonicTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: T.text,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  mnemonicBody: {
    fontFamily: fontFamilies.lora,
    fontSize: 13,
    color: T.secondary,
    lineHeight: 23,
    marginBottom: 16,
  },
  usageTipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: T.surface2,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  usageTipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 18,
  },
  mnemonicFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  mnemonicFooterText: {
    fontSize: 11,
    color: T.tertiary,
    lineHeight: 18,
  },
  skeletonLine: {
    backgroundColor: T.surface2,
    borderRadius: 4,
  },
  skeletonFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  generatingText: {
    fontSize: 12,
    color: T.tertiary,
  },
  errorCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.wrong + "44",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: T.text,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 13,
    color: T.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.primary + "15",
    borderWidth: 1,
    borderColor: T.primary + "44",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: T.primary,
  },
  ctaRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: T.bg,
    borderTopWidth: 1,
    borderTopColor: T.border,
    gap: 8,
  },
  startBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 13,
    color: T.secondary,
  },
  textRefSection: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  textRefToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  textRefToggleLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: T.secondary,
  },
  textRefBody: {
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textRefContent: {
    fontSize: 15,
    color: T.text,
    lineHeight: 26,
    fontFamily: fontFamilies.lora,
  },
});
