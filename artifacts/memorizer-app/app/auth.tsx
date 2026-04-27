import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { T, fontFamilies } from "@/constants/tokens";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/context/AppContext";
import { AUTH_GATE_SESSION_THRESHOLD } from "@/constants/features";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const { sessions } = useApp();
  const [signingIn, setSigningIn] = React.useState(false);
  const params = useLocalSearchParams<{ required?: string }>();
  const isRequired = params.required === "1";

  // Hard gate: block Android hardware back so the user cannot escape sign-in.
  useEffect(() => {
    if (!isRequired) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [isRequired]);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await login();
    } finally {
      setSigningIn(false);
    }
  };

  const handleDismiss = async () => {
    if (isRequired) return;
    // Each dismissal defers the next auto-prompt by +5 sessions.
    // After 3 dismissals we stop auto-prompting forever — user can still sign in from Settings.
    const sessionCount = sessions.length;
    const nextAt = Math.max(sessionCount, AUTH_GATE_SESSION_THRESHOLD) + 5;
    try {
      const dismissCountStr = await AsyncStorage.getItem("@verbitra:auth_gate_dismiss_count");
      const dismissCount = (dismissCountStr ? Number(dismissCountStr) : 0) + 1;
      await AsyncStorage.setItem("@verbitra:auth_gate_dismiss_count", String(dismissCount));
      await AsyncStorage.setItem("@verbitra:auth_gate_next_at", String(nextAt));
      if (dismissCount >= 3) {
        await AsyncStorage.setItem("@verbitra:auth_gate_silenced", "1");
      }
    } catch {}
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      {!isRequired ? (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={20} color={T.secondary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtnSpacer} />
      )}

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Feather name="zap" size={32} color={T.primary} />
        </View>

        <Text style={styles.title}>
          {isRequired ? "Sign in to keep going" : "Sign in to sync"}
        </Text>
        <Text style={styles.subtitle}>
          {isRequired
            ? "Sign in to keep using Verbitra. Your texts and progress will sync to your account."
            : "Your texts, progress, and streaks saved across all your devices."}
        </Text>

        <TouchableOpacity
          style={[styles.loginBtn, (signingIn || isLoading) && styles.loginBtnDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={signingIn || isLoading}
        >
          {signingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Log in</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          A secure login page will open in your browser.
        </Text>

        {!isRequired && (
          <TouchableOpacity onPress={handleDismiss} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Maybe later</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
    paddingHorizontal: 24,
  },
  backBtn: {
    alignSelf: "flex-end",
    padding: 8,
  },
  backBtnSpacer: {
    height: 36,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: T.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: T.text,
    fontFamily: fontFamilies.loraBold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: T.secondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  loginBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    color: T.tertiary,
    textAlign: "center",
  },
  skipBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    color: T.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
});
