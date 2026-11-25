import { normalizeText } from "#foundation/matching/utils/normalizeText";
import type { PreparedText } from "#foundation/matching/types/PreparedText";
import type { TextWord } from "#foundation/matching/types/TextWord";

const word = /[\p{L}\p{N}]+/gu;

/**
 * `source` with its normalized text and the words of that text, each a run of
 * letters and digits with its position.
 */
export function prepareText(source: string): PreparedText {
  const text = normalizeText(source);

  const words: TextWord[] = [];

  word.lastIndex = 0;

  for (let match = word.exec(text); match != null; match = word.exec(text)) {
    const [value] = match;

    words.push({
      value,
      start: match.index,
      end: match.index + value.length,
    });
  }

  return {
    source,
    text,
    words,
  };
}
