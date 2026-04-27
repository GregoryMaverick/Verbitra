import { Router } from "express";
import { z } from "zod";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const PostReviewBody = z.object({
  textId: z.string().uuid(),
  rating: z.number().int().min(1).max(4),
  reviewedAt: z.string().datetime().optional(),
  nextDue: z.string(),
  stability: z.number().optional(),
  difficulty: z.number().optional(),
  intervalDays: z.number().int().optional(),
});

router.post("/reviews", requireAuth, async (req, res) => {
  const parsed = PostReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { textId, rating, reviewedAt, nextDue, stability, difficulty, intervalDays } = parsed.data;
  const userId = req.user!.id;

  const ownerCheck = await pool.query<{ id: string }>(
    `SELECT id FROM texts WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [textId, userId],
  );
  if (ownerCheck.rows.length === 0) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const result = await pool.query(
    `INSERT INTO reviews (text_id, user_id, rating, reviewed_at, next_due, stability, difficulty, interval_days)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      textId,
      userId,
      rating,
      reviewedAt ?? new Date().toISOString(),
      nextDue,
      stability ?? 0,
      difficulty ?? 0,
      intervalDays ?? 0,
    ],
  );

  res.status(201).json({ id: result.rows[0].id });
});

export default router;
