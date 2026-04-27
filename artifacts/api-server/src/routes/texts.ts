import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { textsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { classifyContent, type ContentType } from "../lib/contentClassifier";
import { generateText } from "../lib/gemini";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/texts", async (req, res) => {
  try {
    const texts = await db.query.textsTable.findMany({
      where: eq(textsTable.userId, req.user!.id),
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    });
    res.json({ texts });
  } catch (err) {
    logger.error({ err }, "Failed to fetch texts");
    res.status(500).json({ error: "Failed to fetch texts" });
  }
});

const CreateTextBody = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  phase: z.number().int().min(1).optional(),
  totalPhases: z.number().int().min(1).optional(),
  recallPct: z.number().int().min(0).max(100).optional(),
  phaseColor: z.string().optional(),
  nextSessionTime: z.string().optional(),
  nextSessionLabel: z.string().optional(),
  daysLeft: z.number().int().optional(),
  consecutiveGoodSessions: z.number().int().min(0).optional(),
  sessionCountInPhase: z.number().int().min(0).optional(),
  contentType: z
    .enum(["ordered-list", "definition", "dialogue", "long-form", "passage"])
    .optional(),
  myCharacterName: z.string().nullable().optional(),
  mode: z.enum(["mnemonic", "intensive", "standard", "spaced"]).nullable().optional(),
  chunks: z.any().nullable().optional(),
});

router.post("/texts", async (req, res) => {
  const parsed = CreateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  try {
    const contentType = parsed.data.contentType ?? classifyContent(parsed.data.content);
    const [text] = await db
      .insert(textsTable)
      .values({
        userId: req.user!.id,
        ...parsed.data,
        contentType,
      })
      .returning();

    res.status(201).json({ text });
  } catch (err) {
    logger.error({ err }, "Failed to create text");
    res.status(500).json({ error: "Failed to create text" });
  }
});

const UpdateTextBody = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  phase: z.number().int().min(1).optional(),
  totalPhases: z.number().int().min(1).optional(),
  recallPct: z.number().int().min(0).max(100).optional(),
  phaseColor: z.string().optional(),
  nextSessionTime: z.string().optional(),
  nextSessionLabel: z.string().optional(),
  daysLeft: z.number().int().optional(),
  consecutiveGoodSessions: z.number().int().min(0).optional(),
  sessionCountInPhase: z.number().int().min(0).optional(),
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
});

router.patch("/texts/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = UpdateTextBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  try {
    const { fsrsLastReview, lastFlashDate, ...textUpdates } = parsed.data;
    const updateData = {
      ...textUpdates,
      fsrsLastReview:
        fsrsLastReview == null ? fsrsLastReview : new Date(fsrsLastReview),
      lastFlashDate:
        lastFlashDate == null ? lastFlashDate : new Date(lastFlashDate),
      updatedAt: new Date(),
    };

    const [text] = await db
      .update(textsTable)
      .set(updateData)
      .where(and(eq(textsTable.id, id), eq(textsTable.userId, req.user!.id)))
      .returning();

    if (!text) {
      res.status(404).json({ error: "Text not found" });
      return;
    }

    res.json({ text });
  } catch (err) {
    logger.error({ err }, "Failed to update text");
    res.status(500).json({ error: "Failed to update text" });
  }
});

const CONTENT_TYPE_SYSTEM = `You are a text-type classifier. Given a snippet of text, classify it as exactly one of these five types:
- ordered-list: numbered or lettered items (e.g. study notes, to-do items, commandments, steps)
- definition: glossary-style entries where most lines look like "Term: explanation" (vocabulary, key terms)
- dialogue: script/screenplay with speaker names before colons, or stage directions in brackets
- long-form: flowing prose over 200 words without clear list/dialogue structure
- passage: short prose, poems, quotes, or mixed content that is not mainly a glossary or list

Reply with ONLY the type word — no explanation, no punctuation. One word only.`;

async function classifyWithGemini(text: string): Promise<ContentType | null> {
  try {
    const raw = await generateText(
      `Classify this text:\n\n${text.slice(0, 800)}`,
      CONTENT_TYPE_SYSTEM,
    );
    const word = raw.toLowerCase().trim().replace(/[^a-z-]/g, "");
    const valid: ContentType[] = [
      "ordered-list",
      "definition",
      "dialogue",
      "long-form",
      "passage",
    ];
    return valid.includes(word as ContentType) ? (word as ContentType) : null;
  } catch {
    return null;
  }
}

router.post("/texts/:id/detect-content-type", async (req, res) => {
  const { id } = req.params;

  const [row] = await db
    .select()
    .from(textsTable)
    .where(and(eq(textsTable.id, id), eq(textsTable.userId, req.user!.id)))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Text not found" });
    return;
  }

  const ruleResult = classifyContent(row.content);

  const lines = row.content.trim().split(/\n+/).filter((l) => l.trim().length > 0);
  const numberedLines = lines.filter((l) => /^\s*(\d+[\.\)]\s+|\(?[a-z]\)\s+)/i.test(l));
  const dialogueLines = lines.filter((l) => /^[A-Z][A-Za-z .'-]*:\s+\S/m.test(l));
  const wordCount = row.content.trim().split(/\s+/).length;

  const isAmbiguous =
    (ruleResult === "passage" && (numberedLines.length >= 1 || dialogueLines.length >= 1)) ||
    (ruleResult === "passage" && wordCount > 100 && wordCount < 300) ||
    (ruleResult === "dialogue" && dialogueLines.length === 1 && !/\[[A-Z][^\]]+\]/.test(row.content));

  let contentType: ContentType = ruleResult;
  let sourceUsed: "rules" | "gemini" = "rules";

  if (isAmbiguous && process.env.GEMINI_API_KEY) {
    const geminiResult = await classifyWithGemini(row.content);
    if (geminiResult) {
      contentType = geminiResult;
      sourceUsed = "gemini";
    }
  }

  if (contentType !== row.contentType) {
    await db
      .update(textsTable)
      .set({ contentType, updatedAt: new Date() })
      .where(and(eq(textsTable.id, id), eq(textsTable.userId, req.user!.id)));
  }

  res.json({ contentType, source: sourceUsed });
});

router.delete("/texts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [deleted] = await db
      .delete(textsTable)
      .where(and(eq(textsTable.id, id), eq(textsTable.userId, req.user!.id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Text not found" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete text");
    res.status(500).json({ error: "Failed to delete text" });
  }
});

export default router;
