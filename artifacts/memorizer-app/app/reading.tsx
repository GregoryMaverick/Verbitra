import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { fetchMnemonic, type MnemonicResponse } from "@/lib/api";
import { isMnemonicSuitable } from "@/lib/contentClassifier";
import { MnemonicScaffoldCard } from "@/components/MnemonicScaffoldCard";
import { useHardAuthGate } from "@/hooks/useHardAuthGate";

export default function ReadingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ textId: string; textTitle?: string; chunkIndex?: string }>();
  const { texts, updateText } = useApp();
  const { getValidToken } = useAuth();
  useHardAuthGate();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const textId = params.textId ?? "";
  const textTitle = params.textTitle ?? "Your text";
  const chunkIndexParam = params.chunkIndex != null ? Number(params.chunkIndex) : null;
  const entry = texts.find((t) => t.id === textId);
  const activeChunk = chunkIndexParam != null ? entry?.chunks?.find((c) => c.index === chunkIndexParam) ?? null : null;
  const content = activeChunk ? activeChunk.content : (entry?.content ?? "");
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedMinutes = Math.max(1, Math.round(wordCount / 130));
  const contentType = entry?.contentType ?? "passage";

  const [isFinishing, setIsFinishing] = useState(false);
  const [mnemonic, setMnemonic] = useState<MnemonicResponse | null>(null);

  useEffect(() => {
    if (chunkIndexParam != null && activeChunk && !activeChunk.isUnlocked) {
      router.replace({ pathname: "/(tabs)" });
    }
  }, [chunkIndexParam, activeChunk]);

  useEffect(() => {
    if (!textId || textId === "demo" || !isMnemonicSuitable(contentType)) return;
    let cancelled = false;
    getValidToken()
      .then((token) => fetchMnemonic(textId, token))
      .catch(() => fetchMnemonic(textId, null))
      .then((res) => { if (!cancelled && res.status === "ready") setMnemonic(res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [textId, contentType]);

  const handleFinishedReading = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      // Mark Read & Listen as session 1 of Phase 1, then drop into the practice
      // screen which now serves Phase 1 progressive deletion as session 2+.
      if (textId && textId !== "demo") {
        if (chunkIndexParam != null && activeChunk) {
          // Bump chunk's Phase 1 session count without changing phase or streak.
          await updateText(textId, {
            chunks: (entry?.chunks ?? []).map((c) =>
              c.index === chunkIndexParam
                ? { ...c, sessionCountInPhase: Math.max(c.sessionCountInPhase, 1) }
                : c,
            ),
          });
        } else if (entry) {
          await updateText(textId, {
            sessionCountInPhase: Math.max(entry.sessionCountInPhase ?? 0, 1),
          });
        }
      }
      router.replace({
        pathname: "/practice",
        params: {
          textId,
          textTitle,
          chunkIndex: chunkIndexParam != null ? String(chunkIndexParam) : "",
        },
      });
    } finally {
      setIsFinishing(false);
    }
  };

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={{ color: T.text, padding: 20 }}>Text not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={18} color={T.secondary} />
          </TouchableOpacity>
          <View style={styles.phaseBadge}>
            <View style={styles.phaseDot} />
            <Text style={styles.phaseLabel}>P1 · Read Carefully</Text>
          </View>
        </View>
        <View style={styles.readingInfo}>
          <Feather name="clock" size={11} color={T.tertiary} />
          <Text style={styles.readingInfoText}>~{estimatedMinutes} min read</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {mnemonic && (
          <MnemonicScaffoldCard
            mnemonic={mnemonic}
            textId={textId}
            defaultExpanded={true}
          />
        )}

        <View style={styles.textCard}>
          <Text style={styles.textCardLabel}>{textTitle} — Read carefully</Text>
          <Text style={styles.textBody}>{content}</Text>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionIcon}>ⓘ</Text>
          <Text style={styles.instructionText}>
            Read the full text at least once. Notice the structure, rhythm, and key phrases. When you feel ready, tap below to start practice.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.ctaRow, { paddingBottom: bottomPad + 8 }]}>
        <TouchableOpacity
          style={[styles.finishBtn, isFinishing && styles.finishBtnDisabled]}
          onPress={handleFinishedReading}
          disabled={isFinishing}
          activeOpacity={0.85}
          testID="reading-finish-btn"
        >
          <Text style={styles.finishBtnText}>
            {isFinishing ? "Loading…" : "I've read it — start practice"}
          </Text>
          {!isFinishing && <Feather name="arrow-right" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.primary + "1A",
    borderWidth: 1,
    borderColor: T.primary + "44",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.primary },
  phaseLabel: { fontSize: 11, fontWeight: "700" as const, color: T.primary, letterSpacing: 0.5 },
  readingInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  readingInfoText: { fontSize: 11, color: T.tertiary },
  progressTrack: {
    height: 2,
    backgroundColor: T.surface2,
    marginHorizontal: 20,
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    width: "5%",
    backgroundColor: T.primary,
    borderRadius: 1,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  textCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 20,
  },
  textCardLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  textBody: {
    fontFamily: "Lora_400Regular",
    fontSize: 17,
    color: T.text,
    lineHeight: 30,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: T.primary + "10",
    borderWidth: 1,
    borderColor: T.primary + "33",
    borderRadius: 10,
    padding: 12,
  },
  instructionIcon: { fontSize: 13, color: T.primary },
  instructionText: { flex: 1, fontSize: 12, color: T.primary, lineHeight: 18 },
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
  },
  finishBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  finishBtnDisabled: { opacity: 0.5 },
  finishBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
});
