import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import CameraOCRModal from "@/components/CameraOCRModal";
import { chunkText } from "@/lib/chunker";
import { useSubscription } from "@/lib/revenuecat";
import PaywallModal from "@/components/PaywallModal";

const GATE2_SHOWN_KEY = "@memorizer:gate2_shown";

const GATE2_SESSION_THRESHOLD = 14;
const FREE_WORD_LIMIT = 100;
const PRO_WORD_LIMIT = 500;

function deriveTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^[^.!?\n]+/);
  const first = (match ? match[0] : trimmed).trim();
  return first.length > 40 ? first.slice(0, 40) : first;
}

const CHUNK_THRESHOLD = 100;

export default function InputScreen() {
  const insets = useSafeAreaInsets();
  const { setPendingText, setPendingTitle, setPendingUseChunks, sessions } = useApp();
  const { isSubscribed } = useSubscription();
  const params = useLocalSearchParams<{
    textId?: string;
    textTitle?: string;
    prefillContent?: string;
  }>();
  const [text, setText] = useState(params.prefillContent ?? "");
  const [customTitle, setCustomTitle] = useState(() => deriveTitle(params.prefillContent ?? ""));
  const [titleEditedByUser, setTitleEditedByUser] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [useChunks, setUseChunks] = useState(() => {
    const initialWc = (params.prefillContent ?? "").trim().split(/\s+/).filter(Boolean).length;
    return initialWc > CHUNK_THRESHOLD;
  });
  const hasAutoEnabledChunks = React.useRef(useChunks);
  const titleRef = useRef<TextInput>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [gate2PaywallShown, setGate2PaywallShown] = useState(false);

  const gate2Locked = !isSubscribed && sessions.length >= GATE2_SESSION_THRESHOLD;
  const effectiveWordLimit = gate2Locked ? FREE_WORD_LIMIT : PRO_WORD_LIMIT;

  // Load gate2PaywallShown from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(GATE2_SHOWN_KEY).then((val) => {
      if (val) setGate2PaywallShown(true);
    }).catch(() => {});
  }, []);

  const toggleChunk = (i: number) => {
    setExpandedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!titleEditedByUser) {
      setCustomTitle(deriveTitle(text));
    }
  }, [text, titleEditedByUser]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);


  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const alphaWordCount = text.trim()
    ? text.trim().split(/\s+/).filter((w) => /\p{L}{2,}/u.test(w)).length
    : 0;
  const hasEnoughLetters = alphaWordCount >= 5;
  const isNumbersOnly = wordCount >= 5 && !hasEnoughLetters;
  const isOverProLimit = wordCount > PRO_WORD_LIMIT;
  const isOverFreeLimit = gate2Locked && wordCount > FREE_WORD_LIMIT;
  const isOverLimit = isOverProLimit;
  // After gate2 paywall has been shown once, treat over-free-limit the same as disabled
  const isBlockedByGate2 = isOverFreeLimit && gate2PaywallShown;
  const canProceed = wordCount >= 5 && hasEnoughLetters && !isOverProLimit && !isBlockedByGate2;
  const showChunkOption = wordCount > CHUNK_THRESHOLD;

  useEffect(() => {
    if (showChunkOption && !hasAutoEnabledChunks.current) {
      hasAutoEnabledChunks.current = true;
      setUseChunks(true);
    }
  }, [showChunkOption]);

  const chunks = useMemo(() => {
    if (!showChunkOption || !useChunks) return [];
    return chunkText(text);
  }, [text, showChunkOption, useChunks]);

  const handleTitleChange = (v: string) => {
    setTitleEditedByUser(true);
    setCustomTitle(v);
  };

  const handleNext = () => {
    if (gate2Locked && wordCount > FREE_WORD_LIMIT) {
      // Only show paywall once (one-time trigger per gate activation)
      if (!gate2PaywallShown) {
        setGate2PaywallShown(true);
        setPaywallVisible(true);
      }
      return;
    }
    const effectiveTitle = customTitle.trim() || deriveTitle(text) || "Untitled";
    setPendingText(text);
    setPendingTitle(effectiveTitle);
    setPendingUseChunks(showChunkOption && useChunks);
    router.push("/deadline");
  };

  const handleOcrConfirm = useCallback((extractedText: string) => {
    setText(extractedText.trim());
    setCameraModalVisible(false);
  }, []);

  return (
    <>
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={styles.backBtn}
          testID="input-back-btn"
        >
          <Feather name="arrow-left" size={22} color={T.secondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Add text</Text>
          <Text style={styles.headerSubtitle}>Paste or scan from photo</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={[styles.textAreaContainer, showChunkOption && useChunks && styles.textAreaContainerCompact]}>
          <Text style={styles.textAreaLabel}>Your text</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Paste or type your text here…"
            placeholderTextColor={T.tertiary}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
            testID="input-text-area"
            autoFocus={false}
          />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleLabel}>Name your text</Text>
          <View style={styles.titleInputRow}>
            <TextInput
              ref={titleRef}
              style={styles.titleInput}
              value={customTitle}
              onChangeText={handleTitleChange}
              placeholder="Title will auto-fill from your text…"
              placeholderTextColor={T.tertiary}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              autoCorrect={false}
              testID="input-title-field"
            />
            {customTitle.length > 0 && (
              <TouchableOpacity
                onPress={() => { setCustomTitle(""); setTitleEditedByUser(true); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="input-title-clear-btn"
              >
                <Feather name="x-circle" size={16} color={T.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {keyboardVisible && Platform.OS !== "web" && (
          <TouchableOpacity
            style={styles.keyboardDoneBar}
            onPress={Keyboard.dismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.keyboardDoneText}>Done</Text>
          </TouchableOpacity>
        )}

        <View style={styles.wordCountRow}>
          <View style={styles.wordCountLeft}>
            <View
              style={[
                styles.wordCountDot,
                {
                  backgroundColor: isOverLimit ? T.wrong : isOverFreeLimit ? T.hint : text ? T.correct : T.tertiary,
                },
              ]}
            />
            <Text
              style={[
                styles.wordCountText,
                { color: isOverLimit ? T.wrong : isNumbersOnly ? T.wrong : isOverFreeLimit ? T.hint : text ? T.correct : T.tertiary },
              ]}
            >
              {wordCount} words
            </Text>
            <Text style={styles.wordCountLimit}> / {effectiveWordLimit} max{gate2Locked ? " (free)" : ""}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {gate2Locked && (
              <TouchableOpacity onPress={() => setPaywallVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.proUpgradeText}>👑 Go Pro</Text>
              </TouchableOpacity>
            )}
            {text.length > 0 && (
              <TouchableOpacity onPress={() => setText("")} testID="input-clear-btn">
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isNumbersOnly && (
          <View style={styles.numbersWarnRow}>
            <Feather name="alert-circle" size={14} color={T.wrong} />
            <Text style={styles.numbersWarnText}>
              Memorising numbers isn't supported. Try a poem, speech, scripture, or any text with at least 5 words.
            </Text>
          </View>
        )}

        {showChunkOption && (
          <View style={styles.chunkToggleRow}>
            <View style={styles.chunkToggleLeft}>
              <Feather name="layers" size={15} color={useChunks ? T.primary : T.secondary} />
              <View style={styles.chunkToggleText}>
                <Text style={[styles.chunkToggleTitle, { color: useChunks ? T.primary : T.text }]}>
                  Split into chunks
                </Text>
                <Text style={styles.chunkToggleSub}>
                  {useChunks && chunks.length > 0
                    ? `${chunks.length} chunk${chunks.length !== 1 ? "s" : ""} · practice one section at a time`
                    : "Long text — practice one section at a time"}
                </Text>
              </View>
            </View>
            <Switch
              value={useChunks}
              onValueChange={setUseChunks}
              trackColor={{ false: T.border, true: T.primary + "66" }}
              thumbColor={useChunks ? T.primary : T.secondary}
              testID="input-chunk-toggle"
            />
          </View>
        )}

        {showChunkOption && useChunks && chunks.length > 0 && chunks.map((chunk, i) => {
          const cWc = chunk.trim().split(/\s+/).length;
          const isExpanded = expandedChunks.has(i);
          return (
            <View key={i} style={styles.chunkCard}>
              <TouchableOpacity
                style={styles.chunkCardHeader}
                onPress={() => toggleChunk(i)}
                activeOpacity={0.7}
              >
                <View style={styles.chunkBadge}>
                  <Text style={styles.chunkBadgeText}>{i + 1}</Text>
                </View>
                <Text style={styles.chunkWordCount}>{cWc} words</Text>
                <Feather
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={T.tertiary}
                />
              </TouchableOpacity>
              {isExpanded && (
                <Text style={styles.chunkPreviewText}>
                  {chunk.trim()}
                </Text>
              )}
            </View>
          );
        })}

        {!showChunkOption || !useChunks ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => setCameraModalVisible(true)}
              activeOpacity={0.8}
              testID="input-camera-btn"
            >
              <Feather name="camera" size={20} color={T.primary} />
              <View style={styles.uploadBtnTextContainer}>
                <Text style={[styles.uploadBtnLabel, { color: T.primary }]}>Scan from photo</Text>
                <Text style={styles.uploadBtnSub}>
                  {Platform.OS === "web" ? "Turn photos into editable text" : "Camera or photo library"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.ctaContainer, { paddingBottom: bottomPad + 16 }]}>
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            !canProceed && styles.ctaBtnDisabled,
            isOverFreeLimit && !isBlockedByGate2 && styles.ctaBtnGate,
          ]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.85}
          testID="input-next-btn"
        >
          <Text style={styles.ctaBtnText} numberOfLines={1} adjustsFontSizeToFit>
            {isOverFreeLimit && !isBlockedByGate2 ? "Go Pro to continue →" : "Next — set deadline"}
          </Text>
          {!(isOverFreeLimit && !isBlockedByGate2) && <Feather name="arrow-right" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>

    <CameraOCRModal
      visible={cameraModalVisible}
      onClose={() => setCameraModalVisible(false)}
      onConfirm={handleOcrConfirm}
    />

    <PaywallModal
      visible={paywallVisible}
      onDismiss={() => {
        AsyncStorage.setItem(GATE2_SHOWN_KEY, "1").catch(() => {});
        setPaywallVisible(false);
      }}
      onSubscribed={() => setPaywallVisible(false)}
      reason="gate2"
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  headerSubtitle: { fontSize: 13, color: T.tertiary, marginTop: 1 },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  textAreaContainer: {
    minHeight: 160,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 14,
    overflow: "hidden",
    marginBottom: 10,
  },
  textAreaContainerCompact: {
    flex: 0,
    height: 160,
  },
  textAreaLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  textArea: {
    flex: 1,
    minHeight: 120,
    fontSize: 16,
    color: T.text,
    lineHeight: 28,
    fontFamily: "Lora_400Regular",
  },
  titleRow: {
    flexDirection: "column",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
    gap: 6,
  },
  titleLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  titleInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: T.text,
    padding: 0,
  },
  keyboardDoneBar: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
  },
  keyboardDoneText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: T.primary,
  },
  wordCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  wordCountLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  wordCountDot: { width: 8, height: 8, borderRadius: 4 },
  wordCountText: { fontSize: 14, fontWeight: "600" as const },
  wordCountLimit: { fontSize: 13, color: T.tertiary },
  clearText: { fontSize: 13, color: T.tertiary, textDecorationLine: "underline" },
  numbersWarnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#F8717115",
    borderWidth: 1,
    borderColor: "#F8717133",
  },
  numbersWarnText: {
    flex: 1,
    fontSize: 13,
    color: T.wrong,
    lineHeight: 18,
  },
  proUpgradeText: { fontSize: 13, color: T.primary, fontWeight: "600" as const },
  chunkToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 10,
  },
  chunkToggleLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  chunkToggleText: { flex: 1 },
  chunkToggleTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: T.text,
  },
  chunkToggleSub: { fontSize: 12, color: T.tertiary, marginTop: 1 },
  chunkList: {
    maxHeight: 320,
    marginBottom: 10,
  },
  chunkCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  chunkCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chunkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: T.primary + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  chunkBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: T.primary,
  },
  chunkWordCount: { fontSize: 13, color: T.tertiary, flex: 1 },
  chunkPreviewText: { fontSize: 14, color: T.secondary, lineHeight: 22, marginTop: 8 },
  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  uploadBtn: {
    flex: 1,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadBtnTextContainer: {
    alignItems: "flex-start",
  },
  uploadBtnLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: T.secondary,
  },
  uploadBtnSub: { fontSize: 12, color: T.tertiary, marginTop: 2 },
  ctaContainer: { paddingTop: 0 },
  ctaBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaBtnGate: { backgroundColor: T.hint },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
});
