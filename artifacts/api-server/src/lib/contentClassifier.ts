export type ContentType =
  | "ordered-list"
  | "definition"
  | "dialogue"
  | "long-form"
  | "passage";

const NUMBERED_LINE_RE = /^\s*(\d+[\.\)]\s+|\(?[a-z]\)\s+|[-–•*◦‣]\s+)/i;
const DEFINITION_LINE_RE = /^\s*[A-Za-z0-9][^:\n]{0,55}:\s+.{8,}/;
const DIALOGUE_COLON_RE = /^[A-Z][A-Za-z .'-]*:\s+\S/m;
const STAGE_DIRECTION_RE = /\[[A-Z][^\]]+\]/;
const LONG_FORM_WORD_THRESHOLD = 200;

export function classifyContent(text: string): ContentType {
  const trimmed = text.trim();

  const lines = trimmed.split(/\n+/).filter((l) => l.trim().length > 0);
  const numberedLines = lines.filter((l) => NUMBERED_LINE_RE.test(l));
  if (
    numberedLines.length >= 2 ||
    (numberedLines.length >= 1 && lines.length > 0 && numberedLines.length / lines.length >= 0.3)
  ) {
    return "ordered-list";
  }

  const definitionLines = lines.filter((l) => DEFINITION_LINE_RE.test(l));
  if (
    definitionLines.length >= 2 &&
    definitionLines.length / lines.length >= 0.5
  ) {
    return "definition";
  }

  const dialogueColonLines = lines.filter((l) => DIALOGUE_COLON_RE.test(l));
  if (dialogueColonLines.length >= 1 || STAGE_DIRECTION_RE.test(trimmed)) {
    return "dialogue";
  }

  // Plain line list: 3+ non-empty lines where majority are short (≤12 words)
  // and the line-count-to-word-count ratio is high (many lines, few words per line on average).
  if (lines.length >= 3) {
    const totalWords = trimmed.split(/\s+/).filter(Boolean).length;
    const lineToWordRatio = lines.length / Math.max(totalWords, 1);
    const shortLines = lines.filter((l) => l.trim().split(/\s+/).length <= 12);
    if (shortLines.length / lines.length >= 0.7 && lineToWordRatio >= 0.25) {
      return "ordered-list";
    }
  }

  // Comma-separated list: 3+ short segments (≤5 words each) separated by commas
  const commaParts = trimmed.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  if (commaParts.length >= 3) {
    const shortParts = commaParts.filter((s) => s.split(/\s+/).length <= 5);
    if (shortParts.length / commaParts.length >= 0.8) {
      return "ordered-list";
    }
  }

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > LONG_FORM_WORD_THRESHOLD) {
    return "long-form";
  }

  return "passage";
}
