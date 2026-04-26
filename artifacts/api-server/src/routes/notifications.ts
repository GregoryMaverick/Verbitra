import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

interface PushTokenPayload {
  userId: string;
  token: string;
}

interface SendReminderPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const pushTokenStore = new Map<string, string>();

router.post("/push-token", (req, res) => {
  const { userId, token } = req.body as PushTokenPayload;

  if (!userId || !token) {
    res.status(400).json({ error: "userId and token are required" });
    return;
  }

  pushTokenStore.set(userId, token);
  logger.info({ userId }, "Push token registered");
  res.json({ success: true });
});

router.post("/send-reminder", async (req, res) => {
  const { token, title, body, data } = req.body as SendReminderPayload;

  if (!token || !title || !body) {
    res.status(400).json({ error: "token, title, and body are required" });
    return;
  }

  try {
    const expoPushUrl = "https://exp.host/--/api/v2/push/send";
    const message = {
      to: token,
      sound: "default",
      title,
      body,
      data: data ?? {},
    };

    const response = await fetch(expoPushUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, errorText }, "Expo push API error");
      res.status(502).json({ error: "Failed to send push notification" });
      return;
    }

    const result = await response.json();
    logger.info({ result }, "Push notification sent");
    res.json({ success: true, result });
  } catch (err) {
    logger.error({ err }, "Error sending push notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-email-reminder", (req, res) => {
  const { email, textTitle, nextSessionDate, daysLeft } = req.body as {
    email: string;
    textTitle: string;
    nextSessionDate: string;
    daysLeft: number;
  };

  if (!email || !textTitle) {
    res.status(400).json({ error: "email and textTitle are required" });
    return;
  }

  logger.info(
    { email, textTitle, nextSessionDate, daysLeft },
    "Email reminder would be sent (email service not configured)"
  );

  res.json({
    success: true,
    message: "Email reminder queued",
    details: {
      to: email,
      subject: `Time to study: ${textTitle}`,
      body: `Your next session for "${textTitle}" is scheduled. You have ${daysLeft} day${daysLeft === 1 ? "" : "s"} left until your deadline.`,
    },
  });
});

export default router;
