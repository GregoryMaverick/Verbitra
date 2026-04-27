export interface WordToken {
  index: number;
  original: string;
  matchKey: string;
  isPunct: boolean;
}

const PUNCT_ONLY_RE = /^[^a-zA-Z0-9]+$/;
const TRAILING_PUNCT_RE = /^([a-zA-Z0-9''-]+)([^a-zA-Z0-9]*)$/;

export function tokenize(text: string): WordToken[] {
  const raw = text.trim().split(/\s+/);
  return raw
    .filter(w => w.length > 0)
    .map((original, index) => {
      if (PUNCT_ONLY_RE.test(original)) {
        return { index, original, matchKey: "", isPunct: true };
      }
      const match = TRAILING_PUNCT_RE.exec(original);
      const word = match ? match[1] : original;
      return {
        index,
        original,
        matchKey: word.toLowerCase(),
        isPunct: false,
      };
    });
}

export function normalizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9'''-]/g, "");
}
