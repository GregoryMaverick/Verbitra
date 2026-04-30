import { Router, type IRouter, type Request } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { feedbackTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Basic, in-memory rate limiter (good enough for early stage).
// Why: feedback is intentionally allowed without auth, so we need a small
// guardrail against accidental spam and bots.
type RateBucket = { count: number; resetAtMs: number };
const buckets = new Map<string, RateBucket>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 6;

function getClientIp(req: Request): string {
  // Express behind proxies may put the real IP in X-Forwarded-For.
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAtMs <= now) {
    buckets.set(ip, { count: 1, resetAtMs: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_PER_WINDOW) return false;
  bucket.count += 1;
  return true;
}

const FeedbackBody = z.object({
  message: z.string().trim().min(5).max(2000),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  appVersion: z.string().trim().max(32).optional(),
  platform: z.string().trim().max(32).optional(),
  osVersion: z.string().trim().max(64).optional(),
});

router.post("/feedback", async (req, res) => {
  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    res.status(429).json({ error: "Too many feedback submissions. Please try again in a minute." });
    return;
  }

  const parsed = FeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const email = parsed.data.email?.trim();
  const normalizedEmail = email ? email : null;

  try {
    await db.insert(feedbackTable).values({
      userId: req.isAuthenticated() ? req.user.id : null,
      email: normalizedEmail,
      message: parsed.data.message.trim(),
      appVersion: parsed.data.appVersion,
      platform: parsed.data.platform,
      osVersion: parsed.data.osVersion,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to store feedback");
    res.status(500).json({ error: "Failed to store feedback" });
  }
});

export default router;

