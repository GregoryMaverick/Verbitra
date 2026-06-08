/** Word run: Unicode letters, combining marks (decomposed accents), apostrophes. */
const WORD_RUN = /[\p{L}\p{M}'\u2019]+/u;

/** Split text into word runs and punctuation (preserves Latin/Greek diacritics as one word). */
export const TEXT_PARTS_RE = new RegExp(`${WORD_RUN.source}|[^\\p{L}\\p{M}\\s]+`, "gu");

export function splitTextParts(content: string): string[] {
  return content.match(TEXT_PARTS_RE) ?? [];
}

export function isWordPart(part: string): boolean {
  return /\p{L}/u.test(part);
}

/** Case-insensitive compare key; folds accents so "omnipotenti" matches "omnipoténti". */
export function normalizeWordForCompare(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
