const MAX_WORDS = 100;
const MIN_WORDS = 15;
const MAX_CHUNKS = 10;

function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function splitIntoSentences(text: string): string[] {
  const parts: string[] = [];
  let remaining = text.trim();
  const re = /[.!?]+(?:\s|$)/;
  while (remaining.length > 0) {
    const match = re.exec(remaining);
    if (!match) {
      parts.push(remaining.trim());
      break;
    }
    const end = match.index + match[0].trimEnd().length;
    parts.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(match.index + match[0].length).trim();
  }
  return parts.filter((p) => p.length > 0);
}

function groupSentencesIntoChunks(sentences: string[]): string[] {
  const chunks: string[] = [];
  let current = "";
  let currentWords = 0;
  for (const sentence of sentences) {
    const sw = wordCount(sentence);
    if (current && currentWords + sw > MAX_WORDS) {
      chunks.push(current.trim());
      current = sentence;
      currentWords = sw;
    } else {
      current = current ? current + " " + sentence : sentence;
      currentWords += sw;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function mergeSmallTrailing(chunks: string[]): string[] {
  if (chunks.length < 2) return chunks;
  const result = [...chunks];
  const last = result.length - 1;
  if (wordCount(result[last]) < MIN_WORDS) {
    result[last - 1] = result[last - 1] + " " + result[last];
    result.splice(last, 1);
  }
  return result;
}

function enforceMaxChunks(chunks: string[]): string[] {
  let result = [...chunks];
  while (result.length > MAX_CHUNKS) {
    let minSum = Infinity;
    let mergeIdx = 0;
    for (let i = 0; i < result.length - 1; i++) {
      const sum = wordCount(result[i]) + wordCount(result[i + 1]);
      if (sum < minSum) {
        minSum = sum;
        mergeIdx = i;
      }
    }
    result[mergeIdx] = result[mergeIdx] + " " + result[mergeIdx + 1];
    result.splice(mergeIdx + 1, 1);
  }
  return result;
}

export function chunkText(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  if (wordCount(trimmed) <= MAX_WORDS) return [trimmed];

  const paragraphs = trimmed
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let rawChunks: string[];

  if (paragraphs.length > 1) {
    const hasLarge = paragraphs.some((p) => wordCount(p) > MAX_WORDS);
    if (!hasLarge) {
      rawChunks = paragraphs;
    } else {
      rawChunks = [];
      for (const para of paragraphs) {
        if (wordCount(para) <= MAX_WORDS) {
          rawChunks.push(para);
        } else {
          rawChunks.push(...groupSentencesIntoChunks(splitIntoSentences(para)));
        }
      }
    }
  } else {
    rawChunks = groupSentencesIntoChunks(splitIntoSentences(trimmed));
  }

  let chunks = mergeSmallTrailing(rawChunks);
  chunks = enforceMaxChunks(chunks);
  return chunks;
}
