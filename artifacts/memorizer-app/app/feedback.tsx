import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { T, fontFamilies } from "@/constants/tokens";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

function getAppVersionLabel(): string {
  const expoConfigVersion =
    typeof Constants.expoConfig?.version === "string" ? Constants.expoConfig.version : undefined;
  const manifestVersion =
    typeof (Constants as any).manifest2?.extra?.expoClient?.version === "string"
      ? (Constants as any).manifest2.extra.expoClient.version
      : typeof (Constants as any).manifest?.version === "string"
        ? (Constants as any).manifest.version
        : undefined;
  const nativeVersion =
    typeof (Constants as any).nativeAppVersion === "string" ? (Constants as any).nativeAppVersion : undefined;
  return expoConfigVersion ?? manifestVersion ?? nativeVersion ?? "unknown";
}

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { getValidToken } = useAuth();

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const diagnostics = useMemo(() => {
    return {
      appVersion: getAppVersionLabel(),
      platform: Platform.OS,
      osVersion: String(Platform.Version),
    };
  }, []);

  const canSend = message.trim().length >= 5 && !isSending;

  const handleSend = async () => {
    if (!API_BASE_URL) {
      Alert.alert("Not configured", "The API base URL is not set for this build.");
      return;
    }

    const trimmed = message.trim();
    if (trimmed.length < 5) {
      Alert.alert("Add more detail", "Please write at least a sentence so we can act on it.");
      return;
    }

    setIsSending(true);
    try {
      const token = await getValidToken();
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: trimmed,
          email: email.trim(),
          ...diagnostics,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.error ?? `HTTP ${res.status}`);
      }

      Alert.alert("Sent", "Thanks — your feedback helps a lot.", [
        {
          text: "Done",
          onPress: () => router.back(),
        },
      ]);
      setMessage("");
      setEmail("");
    } catch (err) {
      Alert.alert(
        "Couldn’t send feedback",
        "Please check your internet connection and try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color={T.secondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEyebrow}>Verbitra</Text>
          <Text style={styles.headerTitle}>Feedback</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>What should we improve?</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Tell us what you liked, what felt confusing, or what you wish it did…"
          placeholderTextColor={T.tertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          editable={!isSending}
          maxLength={2000}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Email (optional)</Text>
        <TextInput
          style={styles.emailInput}
          placeholder="you@example.com"
          placeholderTextColor={T.tertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSending}
          maxLength={254}
        />

        <View style={styles.diagRow}>
          <Text style={styles.diagText}>v{diagnostics.appVersion}</Text>
          <Text style={styles.diagDot}>·</Text>
          <Text style={styles.diagText}>{diagnostics.platform}</Text>
          <Text style={styles.diagDot}>·</Text>
          <Text style={styles.diagText}>{diagnostics.osVersion}</Text>
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.85}
          testID="feedback-send"
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
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
  card: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 1.0,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  messageInput: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surface2,
    padding: 14,
    color: T.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilies.geist,
  },
  emailInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surface2,
    padding: 14,
    color: T.text,
    fontSize: 14,
    fontFamily: fontFamilies.geist,
  },
  diagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    marginBottom: 12,
  },
  diagText: { fontSize: 12, color: T.tertiary },
  diagDot: { fontSize: 12, color: T.border },
  sendBtn: {
    marginTop: 6,
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.55,
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700" as const,
  },
});

