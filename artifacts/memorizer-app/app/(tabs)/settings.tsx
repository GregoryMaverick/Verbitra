import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T, fontFamilies } from "@/constants/tokens";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { requestNotificationPermission, getAndStorePushToken, cancelAllNotifications } from "@/hooks/useNotifications";
import { useSubscription } from "@/lib/revenuecat";
import PaywallModal from "@/components/PaywallModal";
import { SUBSCRIPTIONS_ENABLED } from "@/constants/features";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  testID?: string;
  danger?: boolean;
  right?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, testID, danger, right }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !right}
      testID={testID}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconBox, danger && styles.settingIconBoxDanger]}>
          <Feather name={icon} size={16} color={danger ? "#F87171" : T.primary} />
        </View>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
      </View>
      {right ?? (
        <>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {onPress && (
            <Feather name="chevron-right" size={16} color={danger ? "#F87171" : T.tertiary} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, "0");
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${ampm}`;
}

function TimePickerModal({
  visible,
  hour,
  minute,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  hour: number;
  minute: number;
  onConfirm: (h: number, m: number) => void;
  onClose: () => void;
}) {
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reminder time</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={T.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.pickerItem, selectedHour === h && styles.pickerItemSelected]}
                    onPress={() => setSelectedHour(h)}
                    testID={`hour-${h}`}
                  >
                    <Text style={[styles.pickerItemText, selectedHour === h && styles.pickerItemTextSelected]}>
                      {h.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.pickerColon}>:</Text>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Min</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerItem, selectedMinute === m && styles.pickerItemSelected]}
                    onPress={() => setSelectedMinute(m)}
                    testID={`minute-${m}`}
                  >
                    <Text style={[styles.pickerItemText, selectedMinute === m && styles.pickerItemTextSelected]}>
                      {m.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <Text style={styles.previewTime}>
            Reminders at {formatTime(selectedHour, selectedMinute)}
          </Text>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(selectedHour, selectedMinute)}
            testID="time-picker-confirm"
          >
            <Text style={styles.confirmBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isSyncing, notificationSettings, setNotificationSettings } = useApp();
  const { isSubscribed } = useSubscription();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const PRIVACY_URL = "https://verbitra-landing.onrender.com/privacy.html";
  const FEEDBACK_EMAIL = "ideasandbets@gmail.com";

  const getAppVersionLabel = () => {
    const expoConfigVersion = Constants.expoConfig?.version;
    const manifestVersion =
      typeof (Constants as any).manifest?.version === "string" ? (Constants as any).manifest.version : undefined;
    const nativeVersion =
      typeof (Constants as any).nativeAppVersion === "string" ? (Constants as any).nativeAppVersion : undefined;
    return expoConfigVersion ?? manifestVersion ?? nativeVersion ?? "unknown";
  };

  const openExternalUrl = async (url: string, cannotOpenMessage: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert("Can't open link", cannotOpenMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Can't open link", cannotOpenMessage);
    }
  };

  const handleOpenPrivacyPolicy = () => {
    openExternalUrl(PRIVACY_URL, `Please visit:\n${PRIVACY_URL}`);
  };

  const handleSendFeedback = () => {
    router.push("/feedback");
  };

  const handleToggleGlobalNotifications = async (value: boolean) => {
    if (value && Platform.OS !== "web") {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationSettings({ globalEnabled: true });
        getAndStorePushToken();
      }
    } else {
      setNotificationSettings({ globalEnabled: value });
      if (!value) {
        cancelAllNotifications();
      }
    }
  };

  const handleTimeSave = (h: number, m: number) => {
    setNotificationSettings({ reminderHour: h, reminderMinute: m });
    setTimePickerVisible(false);
  };

  const { globalEnabled, reminderHour, reminderMinute } = notificationSettings;
  const reminderTimeLabel = formatTime(reminderHour, reminderMinute);

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "You'll be signed out on this device. Your texts will remain saved locally.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Verbitra</Text>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {SUBSCRIPTIONS_ENABLED && <>
          <Text style={styles.sectionLabel}>Subscription</Text>
          <View style={styles.section}>
            {isSubscribed ? (
              <View style={styles.proActiveRow}>
                <View style={styles.proActiveBadge}>
                  <Text style={styles.proActiveBadgeText}>👑 PRO</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proActiveLabel}>Pro member</Text>
                  <Text style={styles.proActiveDesc}>All features unlocked — thank you!</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.goProBtn}
                onPress={() => setPaywallVisible(true)}
                activeOpacity={0.85}
                testID="settings-go-pro-btn"
              >
                <Text style={styles.goProEmoji}>👑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goProLabel}>Upgrade to Pro</Text>
                  <Text style={styles.goProDesc}>AI memory aids · up to 500 words per text</Text>
                </View>
                <Feather name="chevron-right" size={16} color={T.primary} />
              </TouchableOpacity>
            )}
          </View>
        </>}

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          {user ? (
            <>
              <View style={styles.accountRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    <Feather name="user" size={16} color={T.primary} />
                  </View>
                  <View>
                    <Text style={styles.signedInLabel}>Signed in as</Text>
                    <Text style={styles.signedInEmail}>{user.email}</Text>
                  </View>
                </View>
                {isSyncing && (
                  <ActivityIndicator size="small" color={T.primary} />
                )}
              </View>
              <View style={styles.divider} />
              <SettingRow
                icon="log-out"
                label="Sign out"
                onPress={handleSignOut}
                danger
                testID="setting-sign-out"
              />
            </>
          ) : (
            <SettingRow
              icon="zap"
              label="Sign in to sync your texts"
              onPress={() => router.push("/auth")}
              testID="setting-sign-in"
            />
          )}
        </View>

        <Text style={styles.sectionLabel}>Reminders</Text>
        <View style={styles.section}>
          <SettingRow
            icon="bell"
            label="Push notifications"
            testID="setting-notifications-toggle"
            right={
              Platform.OS !== "web" ? (
                <Switch
                  value={globalEnabled}
                  onValueChange={handleToggleGlobalNotifications}
                  trackColor={{ false: T.border, true: T.primary + "88" }}
                  thumbColor={globalEnabled ? T.primary : T.secondary}
                  testID="notifications-switch"
                />
              ) : (
                <Text style={styles.settingValue}>Mobile only</Text>
              )
            }
          />
          {globalEnabled && Platform.OS !== "web" && (
            <>
              <View style={styles.divider} />
              <SettingRow
                icon="clock"
                label="Daily reminder time"
                value={reminderTimeLabel}
                onPress={() => setTimePickerVisible(true)}
                testID="setting-reminder-time"
              />
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>Study preferences</Text>
        <View style={styles.section}>
          <SettingRow icon="target" label="Default deadline" value="14 days" />
          <View style={styles.divider} />
          <SettingRow icon="moon" label="Appearance" value="Dark" />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <SettingRow icon="info" label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <SettingRow
            icon="file-text"
            label="Privacy Policy"
            onPress={handleOpenPrivacyPolicy}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="message-circle"
            label="Feedback"
            onPress={handleSendFeedback}
          />
        </View>
      </ScrollView>

      <TimePickerModal
        visible={timePickerVisible}
        hour={reminderHour}
        minute={reminderMinute}
        onConfirm={handleTimeSave}
        onClose={() => setTimePickerVisible(false)}
      />

      <PaywallModal
        visible={paywallVisible}
        onDismiss={() => setPaywallVisible(false)}
        reason="generic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: T.tertiary,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 20,
  },
  section: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  goProBtn: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: `${T.primary}14`,
  },
  goProEmoji: { fontSize: 24 },
  goProLabel: { fontSize: 15, fontWeight: "700" as const, color: T.primary },
  goProDesc: { fontSize: 12, color: T.secondary, marginTop: 1 },
  proActiveRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  proActiveBadge: {
    backgroundColor: `${T.correct}20`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  proActiveBadgeText: { fontSize: 13, fontWeight: "700" as const, color: T.correct },
  proActiveLabel: { fontSize: 15, fontWeight: "600" as const, color: T.text },
  proActiveDesc: { fontSize: 12, color: T.secondary, marginTop: 1 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: T.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  settingIconBoxDanger: {
    backgroundColor: "#F87171" + "1A",
  },
  settingLabel: { fontSize: 14, color: T.text, fontWeight: "500" as const, flex: 1, marginRight: 8 },
  settingLabelDanger: { color: "#F87171" },
  settingValue: { fontSize: 14, color: T.tertiary, marginRight: 6 },
  divider: { height: 1, backgroundColor: T.border, marginLeft: 58 },
  signedInLabel: {
    fontSize: 11,
    color: T.tertiary,
    marginBottom: 1,
  },
  signedInEmail: {
    fontSize: 14,
    color: T.text,
    fontWeight: "500" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: T.text,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  pickerColumn: { alignItems: "center" },
  pickerLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: T.tertiary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  pickerScroll: { height: 160, width: 70 },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 2,
  },
  pickerItemSelected: { backgroundColor: T.primary + "22", borderWidth: 1, borderColor: T.primary + "55" },
  pickerItemText: { fontSize: 18, color: T.secondary, fontWeight: "500" as const },
  pickerItemTextSelected: { color: T.primary, fontWeight: "700" as const },
  pickerColon: {
    fontSize: 22,
    color: T.tertiary,
    fontWeight: "700" as const,
    marginTop: 30,
  },
  previewTime: {
    fontSize: 14,
    color: T.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
