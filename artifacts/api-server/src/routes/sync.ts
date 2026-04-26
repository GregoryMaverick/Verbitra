import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { textsTable, sessionsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { classifyContent } from "../lib/contentClassifier";

const router: IRouter = Router();

router.use(requireAuth);

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LocalTextSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  phase: z.number().int().min(1).default(1),
  totalPhases: z.number().int().min(1).default(3),
  recallPct: z.number().int().min(0).max(100).default(0),
  phaseColor: z.string().default("#818CF8"),
  nextSessionTime: z.string().default(""),
  nextSessionLabel: z.string().default(""),
  daysLeft: z.number().int().default(0),
  consecutiveGoodSessions: z.number().int().min(0).default(0),
  sessionCountInPhase: z.number().int().min(0).default(0),
  contentType: z
    .enum(["ordered-list", "definition", "dialogue", "long-form", "passage"])
    .optional(),
  myCharacterName: z.string().nullable().optional(),
  mode: z.enum(["mnemonic", "intensive", "standard", "spaced"]).nullable().optional(),
  nextReviewDue: z.string().nullable().optional(),
  fsrsStability: z.number().nullable().optional(),
  fsrsDifficulty: z.number().nullable().optional(),
  fsrsReps: z.number().int().nullable().optional(),
  fsrsLapses: z.number().int().nullable().optional(),
  fsrsState: z.number().int().nullable().optional(),
  fsrsLastReview: z.string().nullable().optional(),
  lastFlashDate: z.string().nullable().optional(),
  chunks: z.any().nullable().optional(),
  updatedAt: z.string().datetime().optional(),
});

const LocalSessionSchema = z.object({
  id: z.string(),
  textId: z.string(),
  phase: z.number().int().min(1),
  score: z.number().int().min(0).max(100).default(0),
  completedAt: z.string().datetime().optional(),
  chunkIndex: z.number().int().nullable().optional(),
});

const SyncBody = z.object({
  texts: z.array(LocalTextSchema).optional().default([]),
  sessions: z.array(LocalSessionSchema).optional().default([]),
});

router.post("/sync", async (req, res) => {
  const parsed = SyncBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const { texts: localTexts, sessions: localSessions } = parsed.data;

  try {
    const serverTexts = await db.query.textsTable.findMany({
      where: eq(textsTable.userId, userId),
    });

    const serverTextMap = new Map(serverTexts.map((t) => [t.id, t]));
    const idMapping = new Map<string, string>();

    for (const localText of localTexts) {
      const localUpdatedAt = localText.updatedAt ? new Date(localText.updatedAt) : new Date(0);
      const isValidUuid = uuidRegex.test(localText.id);

      if (isValidUuid && serverTextMap.has(localText.id)) {
        const serverText = serverTextMap.get(localText.id)!;
        if (localUpdatedAt > serverText.updatedAt) {
          await db
            .update(textsTable)
            .set({
              title: localText.title,
              content: localText.content,
              phase: localText.phase,
              totalPhases: localText.totalPhases,
              recallPct: localText.recallPct,
              phaseColor: localText.phaseColor,
              nextSessionTime: localText.nextSessionTime,
              nextSessionLabel: localText.nextSessionLabel,
              daysLeft: localText.daysLeft,
              consecutiveGoodSessions: localText.consecutiveGoodSessions,
              sessionCountInPhase: localText.sessionCountInPhase,
              contentType: localText.contentType ?? classifyContent(localText.content),
              myCharacterName: localText.myCharacterName ?? null,
              mode: localText.mode ?? null,
              nextReviewDue: localText.nextReviewDue ?? null,
              fsrsStability: localText.fsrsStability ?? null,
              fsrsDifficulty: localText.fsrsDifficulty ?? null,
              fsrsReps: localText.fsrsReps ?? null,
              fsrsLapses: localText.fsrsLapses ?? null,
              fsrsState: localText.fsrsState ?? null,
              fsrsLastReview: localText.fsrsLastReview ? new Date(localText.fsrsLastReview) : null,
              lastFlashDate: localText.lastFlashDate ? new Date(localText.lastFlashDate) : null,
              chunks: localText.chunks ?? null,
              updatedAt: localUpdatedAt,
            })
            .where(and(eq(textsTable.id, localText.id), eq(textsTable.userId, userId)));
        }
        idMapping.set(localText.id, localText.id);
      } else {
        const [inserted] = await db
          .insert(textsTable)
          .values({
            userId,
            title: localText.title,
            content: localText.content,
            phase: localText.phase,
            totalPhases: localText.totalPhases,
            recallPct: localText.recallPct,
            phaseColor: localText.phaseColor,
            nextSessionTime: localText.nextSessionTime,
            nextSessionLabel: localText.nextSessionLabel,
            daysLeft: localText.daysLeft,
            consecutiveGoodSessions: localText.consecutiveGoodSessions,
            sessionCountInPhase: localText.sessionCountInPhase,
            contentType: localText.contentType ?? classifyContent(localText.content),
            myCharacterName: localText.myCharacterName ?? null,
            mode: localText.mode ?? null,
            nextReviewDue: localText.nextReviewDue ?? null,
            fsrsStability: localText.fsrsStability ?? null,
            fsrsDifficulty: localText.fsrsDifficulty ?? null,
            fsrsReps: localText.fsrsReps ?? null,
            fsrsLapses: localText.fsrsLapses ?? null,
            fsrsState: localText.fsrsState ?? null,
            fsrsLastReview: localText.fsrsLastReview ? new Date(localText.fsrsLastReview) : null,
            lastFlashDate: localText.lastFlashDate ? new Date(localText.lastFlashDate) : null,
            chunks: localText.chunks ?? null,
            updatedAt: localUpdatedAt,
          })
          .returning();
        idMapping.set(localText.id, inserted.id);
      }
    }

    // Sessions are immutable completed-event records: a session's data does not change after
    // creation. The appropriate merge strategy is therefore "insert-if-not-exists by stable ID"
    // (i.e. last-write-wins degenerates to insert-once for immutable records). The client is
    // responsible for generating a stable UUID per session so repeated syncs are idempotent.
    for (const localSession of localSessions) {
      const mappedTextId = idMapping.get(localSession.textId) ?? localSession.textId;

      if (!uuidRegex.test(mappedTextId)) continue;

      const textExists = await db.query.textsTable.findFirst({
        where: and(eq(textsTable.id, mappedTextId), eq(textsTable.userId, userId)),
      });
      if (!textExists) continue;

      const completedAt = localSession.completedAt
        ? new Date(localSession.completedAt)
        : new Date();

      type SessionInsert = typeof sessionsTable.$inferInsert;
      const baseValues: SessionInsert = {
        textId: mappedTextId,
        userId,
        phase: localSession.phase,
        score: localSession.score,
        completedAt,
        chunkIndex: localSession.chunkIndex ?? null,
      };

      const sessionInsert: SessionInsert = uuidRegex.test(localSession.id)
        ? { ...baseValues, id: localSession.id }
        : baseValues;

      await db.insert(sessionsTable).values(sessionInsert).onConflictDoNothing();
    }

    const [mergedTexts, mergedSessions] = await Promise.all([
      db.query.textsTable.findMany({
        where: eq(textsTable.userId, userId),
        orderBy: (t, { desc }) => [desc(t.updatedAt)],
      }),
      db.query.sessionsTable.findMany({
        where: eq(sessionsTable.userId, userId),
        orderBy: (s, { desc }) => [desc(s.completedAt)],
      }),
    ]);

    res.json({
      texts: mergedTexts,
      sessions: mergedSessions,
      idMapping: Object.fromEntries(idMapping),
    });
  } catch (err) {
    logger.error({ err }, "Failed to sync");
    res.status(500).json({ error: "Failed to sync" });
  }
});

export default router;
