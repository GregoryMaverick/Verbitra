import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PUSH_TOKEN_KEY = "memorizer_push_token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getAndStorePushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

export async function scheduleSessionNotification(params: {
  textId: string;
  textTitle: string;
  deadlineDate: Date;
  nextSessionAt: Date;
  daysLeft: number;
  reminderHour: number;
  reminderMinute: number;
}): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const { textId, textTitle, deadlineDate, nextSessionAt, daysLeft, reminderHour, reminderMinute } = params;

    await cancelTextNotifications(textId);

    const triggerDate = new Date(nextSessionAt);
    triggerDate.setHours(reminderHour, reminderMinute, 0, 0);

    if (triggerDate <= new Date()) return null;

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to study",
        body: `${textTitle} — your ${formatDeadline(deadlineDate)} deadline is in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        data: { textId, screen: "practice", url: `verbitra://practice?textId=${textId}` },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    await storeNotificationId(textId, notifId);
    return notifId;
  } catch {
    return null;
  }
}

export async function scheduleOverdueNudge(params: {
  textId: string;
  textTitle: string;
  nudgeAt: Date;
}): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const { textId, textTitle, nudgeAt } = params;
    if (nudgeAt <= new Date()) return null;

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't lose your streak",
        body: `You're overdue on "${textTitle}" — pick up where you left off`,
        data: { textId, screen: "practice", url: `verbitra://practice?textId=${textId}` },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nudgeAt,
      },
    });

    await storeNotificationId(textId + "_nudge", notifId);
    return notifId;
  } catch {
    return null;
  }
}

export async function cancelTextNotifications(textId: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const ids = await getStoredNotificationIds(textId);
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await clearNotificationIds(textId);

    const nudgeIds = await getStoredNotificationIds(textId + "_nudge");
    for (const id of nudgeIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await clearNotificationIds(textId + "_nudge");
  } catch {
  }
}

export async function scheduleReviewNotification(params: {
  textId: string;
  textTitle: string;
  reviewDue: Date;
}): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const { textId, textTitle, reviewDue } = params;
    const triggerDate = new Date(reviewDue);
    triggerDate.setHours(16, 0, 0, 0);
    if (triggerDate <= new Date()) return null;

    const existingReviewIds = await getStoredNotificationIds(textId + "_review");
    for (const id of existingReviewIds) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    }
    await clearNotificationIds(textId + "_review");

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Review time",
        body: `"${textTitle}" is due for review — keep it fresh`,
        data: { textId, screen: "practice", isReview: true, url: `verbitra://practice?textId=${textId}&isReview=true` },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    await storeNotificationId(textId + "_review", notifId);
    return notifId;
  } catch {
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
  }
}

const NOTIF_IDS_PREFIX = "memorizer_notif_ids_";

async function storeNotificationId(textId: string, notifId: string): Promise<void> {
  try {
    const key = NOTIF_IDS_PREFIX + textId;
    const existing = await AsyncStorage.getItem(key);
    const ids: string[] = existing ? JSON.parse(existing) : [];
    ids.push(notifId);
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch {
  }
}

async function getStoredNotificationIds(textId: string): Promise<string[]> {
  try {
    const key = NOTIF_IDS_PREFIX + textId;
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function clearNotificationIds(textId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIF_IDS_PREFIX + textId);
  } catch {
  }
}

function formatDeadline(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
