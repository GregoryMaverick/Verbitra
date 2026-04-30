import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PurchasesPackage } from "react-native-purchases";
import { T } from "@/constants/tokens";
import { useSubscription } from "@/lib/revenuecat";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSubscribed?: () => void;
  reason?: "gate1" | "gate2" | "generic";
  nonDismissable?: boolean;
}

const PRO_FEATURES = [
  { icon: "zap" as const, label: "AI-generated mnemonics & acronyms", desc: "Let AI build memory hooks for any text" },
  { icon: "file-text" as const, label: "Up to 500 words per text", desc: "5× more than the free 100-word limit" },
  { icon: "cloud" as const, label: "Cloud sync across devices", desc: "Your progress synced everywhere" },
];

function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product?.priceString ?? "";
}

function formatPeriod(pkg: PurchasesPackage): string {
  const id: string = pkg.packageType ?? pkg.identifier ?? "";
  if (id.includes("annual") || id.includes("ANNUAL") || id.includes("yearly") || id.includes("rc_annual")) return "/ year";
  if (id.includes("monthly") || id.includes("MONTHLY") || id.includes("rc_monthly")) return "/ month";
  const period = (pkg.product as { subscriptionPeriod?: string }).subscriptionPeriod ?? "";
  if (period === "P1M") return "/ month";
  if (period === "P1Y") return "/ year";
  return "";
}

function isAnnual(pkg: PurchasesPackage): boolean {
  const id: string = pkg.packageType ?? pkg.identifier ?? "";
  return id.toLowerCase().includes("annual") || id.toLowerCase().includes("yearly") || id.includes("rc_annual");
}

export default function PaywallModal({ visible, onDismiss, onSubscribed, reason, nonDismissable = false }: Props) {
  const insets = useSafeAreaInsets();
  const { offerings, purchase, restore, isPurchasing, isLoading } = useSubscription();
  const { isAuthenticated } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const effectiveSelected = selectedPkg ?? (offerings ? offerings.find(isAnnual) ?? offerings[0] : null);

  // Fire the purchase automatically once the user finishes signing in
  useEffect(() => {
    if (pendingPurchase && isAuthenticated && effectiveSelected && !isPurchasing) {
      setPendingPurchase(false);
      setSigningIn(false);
      executePurchase();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPurchase, isAuthenticated, effectiveSelected]);

  // Clear pending state if modal is closed mid-login
  useEffect(() => {
    if (!visible) {
      setPendingPurchase(false);
      setSigningIn(false);
    }
  }, [visible]);

  const headlineMap = {
    gate1: "Unlock AI memory aids",
    gate2: "Unlock 500-word texts",
    generic: "Upgrade to Pro",
  };
  const subMap = {
    gate1: "You've completed 7 sessions — great work! AI mnemonics and acronyms are Pro features that supercharge recall.",
    gate2: "Free plan supports up to 100 words. Pro raises that to 500 — paste longer speeches, poems, or scripts.",
    generic: "Free plan includes up to 3 texts. Go Pro for unlimited texts, 500-word passages, and AI memory tools.",
  };

  const headline = headlineMap[reason ?? "generic"];
  const subtitle = subMap[reason ?? "generic"];

  const executePurchase = async () => {
    if (!effectiveSelected) return;
    const ok = await purchase(effectiveSelected);
    if (ok) {
      onSubscribed?.();
      onDismiss();
    }
  };

  const handlePurchase = async () => {
    if (!effectiveSelected) return;
    if (!isAuthenticated) {
      // Sign-in is now a full-screen form (Supabase email + password) rather
      // than a programmatic browser flow, so we send the user there and let
      // the useEffect below resume the purchase when isAuthenticated flips.
      setPendingPurchase(true);
      setSigningIn(true);
      onDismiss();
      router.push("/(auth)/sign-in" as never);
      // We can't tell from here whether the user actually signs in, so clear
      // the spinner after a short grace period — if they do sign in, the
      // useEffect that watches isAuthenticated will trigger executePurchase.
      setTimeout(() => {
        setSigningIn((cur) => {
          if (cur) setPendingPurchase(false);
          return false;
        });
      }, 2000);
      return;
    }
    executePurchase();
  };

  const handleRestore = async () => {
    if (!isAuthenticated) {
      setPendingPurchase(false);
      onDismiss();
      router.push("/(auth)/sign-in" as never);
      return;
    }
    setRestoring(true);
    const ok = await restore();
    setRestoring(false);
    if (ok) {
      onSubscribed?.();
      onDismiss();
    }
  };

  const handleBackdropPress = () => {
    if (!nonDismissable) onDismiss();
  };

  const noOfferings = !isLoading && (!offerings || offerings.length === 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={nonDismissable ? undefined : onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleBackdropPress} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handle} />

          {!nonDismissable && (
            <View style={styles.dismissRow}>
              <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="x" size={20} color={T.secondary} />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, nonDismissable && { paddingTop: 20 }]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.heroRow}>
              <View style={styles.crownBox}>
                <Text style={styles.crownEmoji}>👑</Text>
              </View>
              <Text style={styles.headline}>{headline}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.featureList}>
              {PRO_FEATURES.map((f) => (
                <View key={f.label} style={styles.featureRow}>
                  <View style={styles.featureIconBox}>
                    <Feather name={f.icon} size={15} color={T.primary} />
                  </View>
                  <View style={styles.featureBody}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={T.primary} />
                <Text style={styles.loadingText}>Loading plans…</Text>
              </View>
            ) : offerings && offerings.length > 0 ? (
              <View style={styles.planCards}>
                {offerings.map((pkg: PurchasesPackage) => {
                  const selected = effectiveSelected === pkg;
                  const annual = isAnnual(pkg);
                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      style={[styles.planCard, selected && styles.planCardSelected]}
                      onPress={() => setSelectedPkg(pkg)}
                      activeOpacity={0.8}
                    >
                      {annual && (
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>Best value</Text>
                        </View>
                      )}
                      <View style={styles.planCardInner}>
                        <View style={[styles.planRadio, selected && styles.planRadioSelected]}>
                          {selected && <View style={styles.planRadioDot} />}
                        </View>
                        <View style={styles.planCardText}>
                          <Text style={styles.planPrice}>{formatPrice(pkg)}</Text>
                          <Text style={styles.planPeriod}>{formatPeriod(pkg)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : noOfferings ? (
              <View style={styles.noOfferings}>
                <Text style={styles.noOfferingsText}>
                  {Platform.OS === "web"
                    ? "Subscriptions are available in the iOS and Android apps."
                    : "Subscriptions aren't available in this build — install the published app to subscribe."}
                </Text>
              </View>
            ) : null}

            {!isAuthenticated && (
              <View style={styles.authRequiredRow}>
                <Feather name="user" size={13} color={T.secondary} />
                <Text style={styles.authRequiredText}>
                  An account is required to subscribe — you'll sign in first
                </Text>
              </View>
            )}

            {!noOfferings && (
              <TouchableOpacity
                style={[styles.subscribeBtn, (!effectiveSelected || isPurchasing || signingIn) && styles.subscribeBtnDisabled]}
                onPress={handlePurchase}
                disabled={!effectiveSelected || isPurchasing || signingIn}
                activeOpacity={0.85}
              >
                {isPurchasing || signingIn ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.subscribeBtnText}>
                    {!isAuthenticated
                      ? "Sign in to subscribe"
                      : effectiveSelected
                      ? `Start Pro — ${formatPrice(effectiveSelected)} ${formatPeriod(effectiveSelected)}`
                      : "Subscribe"}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.secondaryRow}>
              {!noOfferings && (
                <>
                  <TouchableOpacity onPress={handleRestore} disabled={restoring} activeOpacity={0.7}>
                    <Text style={styles.secondaryLink}>{restoring ? "Restoring…" : "Restore purchase"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.secondaryDot}>·</Text>
                </>
              )}
              <TouchableOpacity onPress={onDismiss} activeOpacity={0.7}>
                <Text style={styles.secondaryLink}>{noOfferings ? "Close" : "Maybe later"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.legalText}>
              Cancel anytime. Payment charged at confirmation. Subscription renews automatically.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  dismissRow: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 8, gap: 16 },
  heroRow: { alignItems: "center", gap: 8, paddingTop: 8 },
  crownBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${T.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  crownEmoji: { fontSize: 28 },
  headline: { fontSize: 22, fontWeight: "700", color: T.text, textAlign: "center" },
  subtitle: { fontSize: 14, color: T.secondary, textAlign: "center", lineHeight: 20 },
  featureList: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  featureIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: `${T.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  featureBody: { flex: 1, gap: 1 },
  featureLabel: { fontSize: 14, fontWeight: "600", color: T.text },
  featureDesc: { fontSize: 12, color: T.secondary, lineHeight: 16 },
  loadingBox: { alignItems: "center", gap: 8, paddingVertical: 16 },
  loadingText: { color: T.secondary, fontSize: 13 },
  planCards: { gap: 10 },
  planCard: {
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: T.surface2,
  },
  planCardSelected: { borderColor: T.primary },
  saveBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${T.primary}30`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  saveBadgeText: { color: T.primary, fontSize: 11, fontWeight: "700" },
  planCardInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioSelected: { borderColor: T.primary },
  planRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary },
  planCardText: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  planPrice: { fontSize: 20, fontWeight: "700", color: T.text },
  planPeriod: { fontSize: 13, color: T.secondary },
  noOfferings: { alignItems: "center", paddingVertical: 12 },
  noOfferingsText: { color: T.secondary, fontSize: 13, textAlign: "center", lineHeight: 18 },
  authRequiredRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 6,
    backgroundColor: `${T.secondary}12`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  authRequiredText: {
    flex: 1,
    color: T.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  subscribeBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  subscribeBtnDisabled: { opacity: 0.45 },
  subscribeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 2,
  },
  secondaryLink: { color: T.secondary, fontSize: 13 },
  secondaryDot: { color: T.tertiary, fontSize: 13 },
  legalText: { color: T.tertiary, fontSize: 11, textAlign: "center", lineHeight: 16 },
});
