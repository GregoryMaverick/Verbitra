import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { T } from "@/constants/tokens";
import { type MnemonicResponse } from "@/lib/api";

const TECHNIQUE_META: Record<string, { color: string; icon: string; label: string }> = {
  Acronym:      { color: T.primary, icon: "hash",      label: "Acronym" },
  Acrostic:     { color: T.primary, icon: "type",      label: "Acrostic" },
  Rhyme:        { color: T.hint,    icon: "music",     label: "Rhyme" },
  Story:        { color: T.correct, icon: "book-open", label: "Story" },
  KeywordChain: { color: T.correct, icon: "link",      label: "Keyword Chain" },
  Scene:        { color: T.correct, icon: "film",      label: "Scene Anchor" },
  Association:  { color: T.correct, icon: "book-open", label: "Association" },
};

function parseMnemonicContent(content: string) {
  const lines = content.split("\n");
  const title = lines[0]?.trim() ?? "";
  const tipIdx = lines.findIndex((l) => l.trimStart().startsWith("How to use:"));
  const usageTip = tipIdx >= 0
    ? lines[tipIdx]!.replace(/^How to use:\s*/i, "").trim()
    : "";
  return { title, usageTip };
}

interface Props {
  mnemonic: MnemonicResponse;
  textId: string;
  defaultExpanded?: boolean;
}

export function MnemonicScaffoldCard({ mnemonic, textId, defaultExpanded = true }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { title, usageTip } = parseMnemonicContent(mnemonic.content);
  const techniqueKey = (mnemonic.mnemonicType ?? "").trim();
  const technique = TECHNIQUE_META[techniqueKey] ?? { color: T.secondary, icon: "star", label: techniqueKey || "Memory Device" };

  const handleViewFull = () => {
    router.push({ pathname: "/mnemonic", params: { textId, daysLeft: "0", readOnly: "true" } });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.75}
      >
        <View style={[styles.techniquePill, { backgroundColor: technique.color + "18", borderColor: technique.color + "40" }]}>
          <Feather name={technique.icon as "hash"} size={10} color={technique.color} />
          <Text style={[styles.techniqueLabel, { color: technique.color }]}>{technique.label}</Text>
        </View>
        <Text style={styles.headerTitle}>Memory Device</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={T.tertiary} style={{ marginLeft: "auto" }} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.mnemonicTitle}>{title}</Text>

          {usageTip ? (
            <View style={[styles.tipRow, { backgroundColor: technique.color + "0F", borderColor: technique.color + "28" }]}>
              <Feather name="arrow-right-circle" size={12} color={technique.color} style={{ marginTop: 1 }} />
              <Text style={[styles.tipText, { color: technique.color }]}>{usageTip}</Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={handleViewFull} style={styles.viewFullRow} activeOpacity={0.7}>
            <Text style={styles.viewFullText}>View full memory device</Text>
            <Feather name="external-link" size={11} color={T.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  techniquePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  techniqueLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: T.secondary,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  mnemonicTitle: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: T.text,
    letterSpacing: -0.2,
    marginBottom: 10,
    marginTop: 12,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 17,
  },
  viewFullRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
  },
  viewFullText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: T.primary,
  },
});
