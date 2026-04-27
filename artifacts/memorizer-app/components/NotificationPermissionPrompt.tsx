import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { T } from "@/constants/tokens";
import { requestNotificationPermission, getAndStorePushToken } from "@/hooks/useNotifications";
import { useApp } from "@/context/AppContext";

interface NotificationPermissionPromptProps {
  visible: boolean;
  onDismiss: () => void;
}

export function NotificationPermissionPrompt({
  visible,
  onDismiss,
}: NotificationPermissionPromptProps) {
  const { setNotificationSettings } = useApp();

  const handleEnable = async () => {
    setNotificationSettings({ permissionAsked: true });
    if (Platform.OS !== "web") {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationSettings({ globalEnabled: true });
        getAndStorePushToken();
      }
    }
    onDismiss();
  };

  const handleSkip = () => {
    setNotificationSettings({ permissionAsked: true });
    onDismiss();
  };

  if (Platform.OS === "web") return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.iconBox}>
            <Feather name="bell" size={28} color={T.primary} />
          </View>

          <Text style={styles.title}>Stay on track</Text>
          <Text style={styles.body}>
            We'll remind you when your next session is ready — right before you'd forget, not before.
          </Text>

          <View style={styles.benefitList}>
            <BenefitRow icon="clock" text="Session reminders at your preferred time" />
            <BenefitRow icon="trending-up" text="Overdue nudges so you don't lose momentum" />
            <BenefitRow icon="zap" text="Deep-links straight into your practice session" />
          </View>

          <TouchableOpacity
            style={styles.enableBtn}
            onPress={handleEnable}
            activeOpacity={0.85}
            testID="notif-enable-btn"
          >
            <Text style={styles.enableBtnText}>Enable reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            activeOpacity={0.7}
            testID="notif-skip-btn"
          >
            <Text style={styles.skipText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function BenefitRow({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIconBox}>
        <Feather name={icon} size={14} color={T.primary} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    backgroundColor: T.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
    alignItems: "center",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: T.primary + "1A",
    borderWidth: 1,
    borderColor: T.primary + "33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: T.text,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: T.secondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  benefitList: {
    width: "100%",
    gap: 10,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: T.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 13,
    color: T.text,
    flex: 1,
  },
  enableBtn: {
    width: "100%",
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  enableBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    color: T.tertiary,
  },
});
