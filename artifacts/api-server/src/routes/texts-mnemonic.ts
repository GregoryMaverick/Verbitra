import { Router } from "express";
import { db } from "@workspace/db";
import { mnemonics } from "@workspace/db";
import { eq } from "drizzle-orm";
import { optionalAuth } from "../middlewares/auth";
import { generateText } from "../lib/gemini";
import { logger } from "../lib/logger";

const router = Router({ mergeParams: true });

router.use(optionalAuth);

const MNEMONIC_SYSTEM_PROMPT = `You are a precision memory coach who applies the science of mnemonics correctly.

KEY PRINCIPLE: The goal is verbatim recall — word-for-word memorisation. Choose the technique that most directly triggers the exact words of the original text.

You will receive:
1. The text to memorise
2. Its detected content type (ordered-list | passage | definition | dialogue | long-form)

TECHNIQUE SELECTION:

ORDERED-LIST (items, steps, enumerated facts):
  → Acronym: extract a key concept word from each item, take first letters, form a memorable word or acrostic.
  Example: HOMES = Huron, Ontario, Michigan, Erie, Superior

PASSAGE (prayer, quote, law, speech, short factual text):
  → Keyword Chain: extract ONE distinctive trigger word per clause or sentence — words that are ALREADY IN THE TEXT, chosen because they are unusual, concrete, or emotionally charged.
  → Format the chain as: WORD1 → WORD2 → WORD3 → ...
  → Below the chain, list each keyword with a fragment of its clause: "WORD: "...surrounding phrase...""
  → DO NOT write a story or paraphrase. Every trigger word must appear verbatim in the source text.
  Example for "O God, who gave joy to the world through the resurrection of Thy Son...":
    JOY → RESURRECTION → BESEECH → INTERCESSION → EVERLASTING
    joy: "gave JOY to the world"
    resurrection: "through the RESURRECTION of Thy Son"
    beseech: "grant we BESEECH Thee"
    intercession: "through the INTERCESSION of the Virgin Mary"
    everlasting: "joys of EVERLASTING life"

DEFINITION (single-sentence or two-sentence definition):
  → If it has a natural rhythm: Rhyme — a catchy 1–2 line jingle.
  → Otherwise: Keyword Chain (same as passage, but fewer words).
  Example rhyme: "I before E, except after C"

DIALOGUE or LONG-FORM:
  → Scene Anchor: a vivid 2–3 sentence story using sensory/emotional imagery that encodes the 3–4 most critical points. This is appropriate here because the text is too long for keyword chains.

OUTPUT FORMAT — follow EXACTLY:
Line 1: [Title — the chain opening word(s), or the rhyme's first line, or the scene name]
Line 2: [blank]
Lines 3+: [Body — ≤100 words. For KeywordChain: the arrow chain then each "word: phrase" entry. For Rhyme: full rhyme. For Scene: vivid scene.]
[blank line]
How to use: [One sentence action instruction. E.g. "Whisper the chain before each session — each word pulls back the clause around it."]
Type: KeywordChain|Acronym|Acrostic|Rhyme|Scene

RULES:
- For KeywordChain: every trigger word MUST appear verbatim in the source text — no synonyms, no paraphrases
- For Acronym/Acrostic: always show the expansion (each letter = what it stands for)
- For Rhyme: make it genuinely catchy — acoustic rhythm matters more than rhyme quality
- For Scene: use sensory, unusual, or emotional imagery — 10× more memorable than abstract description
- ≤130 words total
- The title must be the first thing the user will recall`;

function parseMnemonicOutput(raw: string): { title: string; body: string; usageTip: string; type: string } {
  const lines = raw.split("\n");

  const title = lines[0]?.trim() || "Memory Device";

  const typeLineIdx = lines.reduce((last, l, i) => (l.trimStart().startsWith("Type:") ? i : last), -1);
  const mnemonicType = typeLineIdx >= 0
    ? lines[typeLineIdx]!.replace(/^Type:\s*/i, "").trim()
    : "Story";

  const usageTipLineIdx = lines.reduce((last, l, i) => (l.trimStart().startsWith("How to use:") ? i : last), -1);
  const usageTip = usageTipLineIdx >= 0
    ? lines[usageTipLineIdx]!.replace(/^How to use:\s*/i, "").trim()
    : "";

  const bodyEnd = usageTipLineIdx >= 0 ? usageTipLineIdx : (typeLineIdx >= 0 ? typeLineIdx : undefined);
  const bodyLines = lines.slice(1, bodyEnd);
  const body = bodyLines.join("\n").trim();

  return { title, body, usageTip, type: mnemonicType };
}

async function generateMnemonic(
  textContent: string,
  contentType?: string,
): Promise<{ title: string; body: string; usageTip: string; type: string }> {
  const contentTypeHint = contentType
    ? `\n\nDetected content type: ${contentType}`
    : "";
  const raw = await generateText(
    `Generate a mnemonic for this text:${contentTypeHint}\n\n${textContent}`,
    MNEMONIC_SYSTEM_PROMPT,
  );
  return parseMnemonicOutput(raw);
}

router.post("/", async (req, res) => {
  const { id: textId } = req.params as { id: string };
  const { content, daysLeft, contentType } = req.body as {
    content?: string;
    daysLeft?: number;
    contentType?: string;
  };

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const existing = await db.select().from(mnemonics).where(eq(mnemonics.textId, textId)).limit(1);

  if (existing.length > 0 && existing[0]!.status === "ready") {
    res.json({
      id: existing[0]!.id,
      textId: existing[0]!.textId,
      content: existing[0]!.content,
      mnemonicType: existing[0]!.mnemonicType,
      status: existing[0]!.status,
    });
    return;
  }

  if (existing.length > 0 && existing[0]!.status === "generating") {
    res.status(202).json({ status: "generating", message: "Generation in progress" });
    return;
  }

  await db.insert(mnemonics).values({
    textId,
    content: "",
    mnemonicType: "pending",
    status: "generating",
  }).onConflictDoUpdate({
    target: mnemonics.textId,
    set: { status: "generating", errorMessage: null },
  });

  res.status(202).json({ status: "generating", message: "Mnemonic generation started" });

  setImmediate(async () => {
    try {
      const { title, body, usageTip, type } = await generateMnemonic(content, contentType);
      // Store: title\n\nbody\n\nHow to use: tip
      const fullContent = usageTip
        ? `${title}\n\n${body}\n\nHow to use: ${usageTip}`
        : `${title}\n\n${body}`;

      await db.update(mnemonics)
        .set({
          content: fullContent,
          mnemonicType: type,
          status: "ready",
          updatedAt: new Date(),
        })
        .where(eq(mnemonics.textId, textId));

      logger.info({ textId, type }, "Mnemonic generated successfully");
    } catch (err) {
      logger.error({ err, textId }, "Mnemonic generation failed");
      await db.update(mnemonics)
        .set({
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(mnemonics.textId, textId));
    }
  });
});

router.get("/", async (req, res) => {
  const { id: textId } = req.params as { id: string };

  const result = await db.select().from(mnemonics).where(eq(mnemonics.textId, textId)).limit(1);

  if (result.length === 0) {
    res.status(404).json({ error: "Mnemonic not found" });
    return;
  }

  const mnemonic = result[0]!;
  res.json({
    id: mnemonic.id,
    textId: mnemonic.textId,
    content: mnemonic.content,
    mnemonicType: mnemonic.mnemonicType,
    status: mnemonic.status,
    errorMessage: mnemonic.errorMessage,
  });
});

export default router;
