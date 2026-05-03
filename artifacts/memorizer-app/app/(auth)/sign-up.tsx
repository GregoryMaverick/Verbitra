// Sign-up screen.
//
// Why this file exists:
// Companion to sign-in.tsx. Creates a new Supabase Auth user. If the
// dashboard has "Confirm email" enabled, Supabase returns no session and the
// user has to click the verification link before they can sign in — we
// surface that as a friendly message instead of pretending sign-up succeeded.

import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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
import { formatAuthScreenError } from "@/lib/formatAuthScreenError";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  // Supabase's default minimum is 6 characters. We mirror that locally so the
  // user gets instant feedback instead of a round-trip rejection.
  const passwordTooShort = password.length > 0 && password.length < 6;
  const canSubmit =
    email.trim().length > 0 && password.length >= 6 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    setConfirmMsg(null);
    try {
      const { needsEmailConfirm } = await signUp(email.trim(), password);
      if (needsEmailConfirm) {
        setConfirmMsg(
          "Account created. Check your email for a confirmation link, then sign in.",
        );
      } else {
        // No confirmation required — signUp already hydrated the user via the API.
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)");
      }
    } catch (err) {
      setErrorMsg(formatAuthScreenError(err));
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={20} color={T.secondary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Feather name="user-plus" size={28} color={T.primary} />
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Sign up so your texts and streaks are saved across devices.
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
              testID="sign-up-email"
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={T.tertiary}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
              testID="sign-up-password"
            />
            {passwordTooShort && (
              <Text style={styles.hint}>Use at least 6 characters.</Text>
            )}

            {errorMsg && (
              <Text style={styles.error} testID="sign-up-error">
                {errorMsg}
              </Text>
            )}
            {confirmMsg && (
              <Text style={styles.success} testID="sign-up-confirm">
                {confirmMsg}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.submit, !canSubmit && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
              testID="sign-up-submit"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Create account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href={"/(auth)/sign-in" as never} replace asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign in</Text>
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
  hint: { color: T.tertiary, fontSize: 12, marginTop: 6 },
  error: { color: "#F87171", fontSize: 13, marginTop: 12, textAlign: "center" },
  success: { color: "#4ADE80", fontSize: 13, marginTop: 12, textAlign: "center" },
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
