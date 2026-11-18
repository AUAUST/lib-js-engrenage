import { listCodeRanges } from "#foundation/markdown/utils/listCodeRanges";

/**
 * Returns the prose of `text`, each code block and code span replaced by a space
 * so the words around it stay apart.
 */
export function stripCode(text: string): string {
  let result = "";
  let last = 0;

  for (const { start, end } of listCodeRanges(text)) {
    result += `${text.slice(last, start)} `;

    last = end;
  }

  return result + text.slice(last);
}
