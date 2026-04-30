// Sign-in screen.
//
// Why this file exists:
// Replaces the old browser-based Replit OIDC flow with a plain
// email + password form that talks to Supabase via our `useAuth().login`
// helper. We surface Supabase's error messages directly so users see
// "Invalid login credentials" rather than an opaque failure.

import { Feather } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T, fontFamilies } from "@/constants/tokens";
import { useAuth } from "@/lib/auth";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const params = useLocalSearchParams<{ required?: string }>();
  const isRequired = params.required === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await login(email.trim(), password);
      // On success, AuthProvider's onAuthStateChange will flip isAuthenticated.
      // We just close the modal/screen so the user lands wherever they were.
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {!isRequired && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={20} color={T.secondary} />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Feather name="log-in" size={28} color={T.primary} />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to sync your texts and progress across devices.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={T.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              testID="sign-in-email"
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={T.tertiary}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              testID="sign-in-password"
            />

            {errorMsg && (
              <Text style={styles.error} testID="sign-in-error">
                {errorMsg}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.submit, !canSubmit && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
              testID="sign-in-submit"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <Link href={"/(auth)/sign-up" as never} replace asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: { alignSelf: "flex-end", padding: 8 },
  content: { flex: 1, justifyContent: "center", gap: 12 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: T.surface2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
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
    fontSize: 14,
    color: T.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  form: { gap: 4 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: T.tertiary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: T.text,
    fontSize: 15,
  },
  error: {
    color: "#F87171",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  submit: {
    marginTop: 18,
    backgroundColor: T.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: { color: T.secondary, fontSize: 14 },
  footerLink: { color: T.primary, fontSize: 14, fontWeight: "600" },
});
