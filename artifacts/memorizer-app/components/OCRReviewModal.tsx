import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { T } from "@/constants/tokens";
import type { OcrWord } from "./CameraOCRModal";

const CONFIDENCE_THRESHOLD = 80;
const WORD_MIN = 5;
const WORD_MAX = 500;

interface OCRReviewModalProps {
  visible: boolean;
  initialText: string;
  ocrWords: OcrWord[];
  onClose: () => void;
  onConfirm: (text: string) => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function buildFlaggedSet(words: OcrWord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of words) {
    if (w.confidence < CONFIDENCE_THRESHOLD && w.text.trim().length > 0) {
      const key = w.text.toLowerCase().replace(/[^a-z0-9'-]/g, "");
      if (key) {
        const existing = map.get(key);
        map.set(key, existing == null ? w.confidence : Math.min(existing, w.confidence));
      }
    }
  }
  return map;
}

interface HighlightedTextProps {
  text: string;
  flaggedMap: Map<string, number>;
}

function HighlightedText({ text, flaggedMap }: HighlightedTextProps) {
  const segments = useMemo(() => {
    if (flaggedMap.size === 0) {
      return [{ word: text, flagged: false }];
    }
    const tokens = text.split(/(\s+)/);
    return tokens.map((token) => {
      const key = token.toLowerCase().replace(/[^a-z0-9'-]/g, "");
      const flagged = key.length > 0 && flaggedMap.has(key);
      return { word: token, flagged };
    });
  }, [text, flaggedMap]);

  return (
    <Text style={styles.highlightedText} selectable={false}>
      {segments.map((seg, i) =>
        seg.flagged ? (
          <Text key={i} style={styles.highlightedWord}>
            {seg.word}
          </Text>
        ) : (
          <Text key={i}>{seg.word}</Text>
        )
      )}
    </Text>
  );
}

export default function OCRReviewModal({
  visible,
  initialText,
  ocrWords,
  onClose,
  onConfirm,
}: OCRReviewModalProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(initialText);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setEditMode(false);
    }
  }, [visible, initialText]);

  const flaggedMap = useMemo(() => buildFlaggedSet(ocrWords), [ocrWords]);
  const flaggedCount = useMemo(
    () => ocrWords.filter((w) => w.confidence < CONFIDENCE_THRESHOLD && w.text.trim().length > 0).length,
    [ocrWords]
  );

  const wordCount = useMemo(() => countWords(text), [text]);
  const isUnder = wordCount < WORD_MIN;
  const isOver = wordCount > WORD_MAX;
  const canConfirm = !isUnder && !isOver;

  const wordCountColor = useMemo(() => {
    if (isOver) return T.wrong;
    if (isUnder && text.length > 0) return T.hint;
    if (!isUnder && !isOver) return T.correct;
    return T.tertiary;
  }, [isOver, isUnder, text]);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    onConfirm(text);
  }, [canConfirm, text, onConfirm]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={T.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review OCR Text</Text>
          <TouchableOpacity
            onPress={() => setEditMode((e) => !e)}
            style={styles.editToggle}
            hitSlop={8}
          >
            <Feather name={editMode ? "eye" : "edit-2"} size={18} color={T.primary} />
          </TouchableOpacity>
        </View>

        {flaggedCount > 0 && (
          <View style={styles.flagBanner}>
            <Feather name="alert-triangle" size={14} color={T.hint} />
            <Text style={styles.flagBannerText}>
              {flaggedCount} word{flaggedCount !== 1 ? "s" : ""} flagged — tap the edit icon to correct them
            </Text>
          </View>
        )}

        <View style={styles.textAreaContainer}>
          <View style={styles.textAreaHeader}>
            <Text style={styles.textAreaLabel}>
              {editMode ? "Edit text" : "Extracted text"}
            </Text>
            {!editMode && flaggedMap.size > 0 && (
              <View style={styles.legendRow}>
                <View style={styles.legendSwatch} />
                <Text style={styles.legendLabel}>low confidence</Text>
              </View>
            )}
          </View>

          {editMode ? (
            <TextInput
              style={styles.textArea}
              multiline
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              placeholderTextColor={T.tertiary}
              placeholder="No text extracted — go back and try again."
              autoFocus
            />
          ) : (
            <ScrollView style={styles.highlightScroll} showsVerticalScrollIndicator={false}>
              {text ? (
                <HighlightedText text={text} flaggedMap={flaggedMap} />
              ) : (
                <Text style={styles.emptyText}>No text extracted — go back and try again.</Text>
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.wordCountRow}>
          <View style={styles.wordCountLeft}>
            <View style={[styles.wordCountDot, { backgroundColor: wordCountColor }]} />
            <Text style={[styles.wordCountText, { color: wordCountColor }]}>
              {wordCount} words
            </Text>
            <Text style={styles.wordCountLimit}> / 500 max</Text>
          </View>
          {isUnder && wordCount > 0 && (
            <Text style={styles.wordCountHint}>Minimum {WORD_MIN} words</Text>
          )}
          {isOver && (
            <Text style={styles.wordCountOver}>{wordCount - WORD_MAX} over limit</Text>
          )}
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>Use this text</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    justifyContent: "space-between",
    marginBottom: 12,
  },
  closeBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: T.text,
    letterSpacing: -0.4,
  },
  editToggle: { padding: 4 },
  flagBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(251, 146, 60, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  flagBannerText: {
    fontSize: 12,
    color: T.hint,
    flex: 1,
  },
  textAreaContainer: {
    flex: 1,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 14,
    overflow: "hidden",
    marginBottom: 10,
  },
  textAreaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  textAreaLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "rgba(251, 146, 60, 0.4)",
    borderWidth: 1,
    borderColor: T.hint,
  },
  legendLabel: {
    fontSize: 10,
    color: T.secondary,
  },
  highlightScroll: { flex: 1 },
  highlightedText: {
    fontSize: 15,
    color: T.text,
    lineHeight: 26,
    fontFamily: "Lora_400Regular",
    flexWrap: "wrap",
  },
  highlightedWord: {
    color: T.hint,
    backgroundColor: "rgba(251, 146, 60, 0.2)",
    fontFamily: "Lora_400Regular",
  },
  emptyText: {
    fontSize: 15,
    color: T.tertiary,
    fontFamily: "Lora_400Regular",
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: T.text,
    lineHeight: 26,
    fontFamily: "Lora_400Regular",
  },
  wordCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  wordCountLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  wordCountDot: { width: 8, height: 8, borderRadius: 4 },
  wordCountText: { fontSize: 13, fontWeight: "600" as const },
  wordCountLimit: { fontSize: 12, color: T.tertiary },
  wordCountHint: { fontSize: 12, color: T.hint },
  wordCountOver: { fontSize: 12, color: T.wrong },
  footer: { paddingTop: 4 },
  confirmBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
