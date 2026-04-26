import { Router } from "express";
import { db } from "@workspace/db";
import { acronyms, textsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { optionalAuth } from "../middlewares/auth";
import { generateText } from "../lib/gemini";
import { logger } from "../lib/logger";

const router = Router({ mergeParams: true });

router.use(optionalAuth);

const ACRONYM_SYSTEM = `You are a memory coach specialising in acronym mnemonics for ordered lists.

Given a numbered or bulleted list, build a memorable acronym using this approach:

SHORT ITEMS (1–3 words each): use the first letter of each item directly.
  Example: Huron, Ontario, Michigan, Erie, Superior → H O M E S → HOMES ✓

SENTENCE ITEMS (4+ words each): do NOT use the first letter of the first word.
  Instead, extract the single most important CONTENT WORD from each sentence — the word that uniquely captures what that sentence is about.
  Use the first letter of that key word.
  Example:
    "You have the right to remain SILENT" → S
    "Anything you say can be USED against you" → U
    "You have the right to an ATTORNEY" → A
    "If you cannot afford one, one will be APPOINTED" → A
  → S U A A → Acrostic: "Speak Up, Assume Advocacy"

MIXED LISTS: apply the sentence rule to any item that is 4+ words.

ACRONYM FORMATION:
  - If the extracted letters form a real word → use it as the acronym.
  - If not → build an acrostic sentence (a short memorable phrase where each word starts with one of the letters in order).

Respond in this exact format (no other text):
ACRONYM: <the acronym word, or the acrostic sentence>
KEYS: <the key word extracted per item, one per line — "1. SILENT", "2. USED", etc. Skip this section if items are single words.>
MEANING: <each letter mapped to the full original item, one per line — "S = You have the right to remain silent">
TIP: <one sentence on how to use this to recall the list>`;

async function generateAcronymTip(content: string): Promise<{ acronym: string; explanation: string }> {
  const raw = await generateText(
    `Create an acronym for this ordered list:\n\n${content.slice(0, 2000)}`,
    ACRONYM_SYSTEM,
  );

  const acronymMatch = raw.match(/ACRONYM:\s*(.+)/i);
  const keysMatch = raw.match(/KEYS:\s*([\s\S]+?)(?:\nMEANING:|$)/i);
  const meaningMatch = raw.match(/MEANING:\s*([\s\S]+?)(?:\nTIP:|$)/i);
  const tipMatch = raw.match(/TIP:\s*(.+)/i);

  const acronym = acronymMatch?.[1]?.trim() ?? "MEMORY";
  const keys = keysMatch?.[1]?.trim() ?? "";
  const meaning = meaningMatch?.[1]?.trim() ?? "";
  const tip = tipMatch?.[1]?.trim() ?? "";

  const parts: string[] = [];
  if (keys) parts.push(`🔑 Key words:\n${keys}`);
  if (meaning) parts.push(meaning);
  if (tip) parts.push(`\n💡 ${tip}`);

  const explanation = parts.join("\n\n");

  return { acronym, explanation };
}

router.post("/", async (req, res) => {
  const { id: textId } = req.params as { id: string };
  const { content } = req.body as { content?: string };

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const [textRow] = await db
    .select({ id: textsTable.id, contentType: textsTable.contentType })
    .from(textsTable)
    .where(eq(textsTable.id, textId))
    .limit(1);

  if (!textRow) {
    res.status(404).json({ error: "Text not found" });
    return;
  }

  if (textRow.contentType !== "ordered-list") {
    res.status(400).json({ error: "Acronym generation is only available for ordered-list texts" });
    return;
  }

  const existing = await db.select().from(acronyms).where(eq(acronyms.textId, textId)).limit(1);

  if (existing.length > 0 && existing[0]!.status === "ready") {
    res.json({
      id: existing[0]!.id,
      textId: existing[0]!.textId,
      acronym: existing[0]!.acronym,
      explanation: existing[0]!.explanation,
      status: existing[0]!.status,
    });
    return;
  }

  if (existing.length > 0 && existing[0]!.status === "generating") {
    res.status(202).json({ status: "generating", message: "Generation in progress" });
    return;
  }

  await db.insert(acronyms).values({
    textId,
    acronym: "",
    explanation: "",
    status: "generating",
  }).onConflictDoUpdate({
    target: acronyms.textId,
    set: { status: "generating", errorMessage: null },
  });

  res.status(202).json({ status: "generating", message: "Acronym generation started" });

  setImmediate(async () => {
    try {
      const { acronym, explanation } = await generateAcronymTip(content);

      await db.update(acronyms)
        .set({ acronym, explanation, status: "ready", updatedAt: new Date() })
        .where(eq(acronyms.textId, textId));

      logger.info({ textId }, "Acronym generated successfully");
    } catch (err) {
      logger.error({ err, textId }, "Acronym generation failed");
      await db.update(acronyms)
        .set({
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(acronyms.textId, textId));
    }
  });
});

router.get("/", async (req, res) => {
  const { id: textId } = req.params as { id: string };

  const result = await db.select().from(acronyms).where(eq(acronyms.textId, textId)).limit(1);

  if (result.length === 0) {
    res.status(404).json({ error: "Acronym not found" });
    return;
  }

  const row = result[0]!;
  res.json({
    id: row.id,
    textId: row.textId,
    acronym: row.acronym,
    explanation: row.explanation,
    status: row.status,
    errorMessage: row.errorMessage,
  });
});

export default router;
