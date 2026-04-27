import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, textsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/texts/:textId/sessions", async (req, res) => {
  const { textId } = req.params;

  try {
    const text = await db.query.textsTable.findFirst({
      where: and(eq(textsTable.id, textId), eq(textsTable.userId, req.user!.id)),
    });

    if (!text) {
      res.status(404).json({ error: "Text not found" });
      return;
    }

    const sessions = await db.query.sessionsTable.findMany({
      where: and(
        eq(sessionsTable.textId, textId),
        eq(sessionsTable.userId, req.user!.id),
      ),
      orderBy: (s, { desc }) => [desc(s.completedAt)],
    });

    res.json({ sessions });
  } catch (err) {
    logger.error({ err }, "Failed to fetch sessions");
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

const CreateSessionBody = z.object({
  // Accept client-generated UUID so this call is idempotent with /sync.
  // When id is provided the server persists that UUID; a repeated call with the same id
  // becomes a no-op (ON CONFLICT DO NOTHING), ensuring only one row per logical session.
  id: z.string().uuid().optional(),
  textId: z.string().uuid(),
  phase: z.number().int().min(1),
  score: z.number().int().min(0).max(100).optional(),
  completedAt: z.string().datetime().optional(),
  chunkIndex: z.number().int().nullable().optional(),
});

router.post("/sessions", async (req, res) => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const { id: clientId, textId, phase, score, completedAt, chunkIndex } = parsed.data;

  try {
    const text = await db.query.textsTable.findFirst({
      where: and(eq(textsTable.id, textId), eq(textsTable.userId, req.user!.id)),
    });

    if (!text) {
      res.status(404).json({ error: "Text not found" });
      return;
    }

    const row = await db
      .insert(sessionsTable)
      .values({
        ...(clientId ? { id: clientId } : {}),
        textId,
        userId: req.user!.id,
        phase,
        score: score ?? 0,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        chunkIndex: chunkIndex ?? null,
      })
      .onConflictDoNothing()
      .returning();

    // If conflict (duplicate id), fetch the existing row to return consistent data.
    const session =
      row[0] ??
      (await db.query.sessionsTable.findFirst({
        where: and(
          eq(sessionsTable.id, clientId!),
          eq(sessionsTable.userId, req.user!.id),
        ),
      }));

    res.status(201).json({ session });
  } catch (err) {
    logger.error({ err }, "Failed to create session");
    res.status(500).json({ error: "Failed to create session" });
  }
});

export default router;
