import { readShellLiteral } from "#tools/github/issues/contract/utils/readShellLiteral";
import type { ShellWord } from "#foundation/shell/index";

const numberPattern = /^(?:\S*\/issues\/|#)?(\d+)$/;

export function readIssueNumber(
  words: readonly ShellWord[],
  valueFlags: ReadonlySet<string>,
): number | undefined {
  for (const [index, word] of words.entries()) {
    const text = readShellLiteral(word);
    const previous = readShellLiteral(words[index - 1]);

    if (
      text === undefined ||
      text.startsWith("-") ||
      (previous !== undefined && valueFlags.has(previous))
    ) {
      continue;
    }

    const number = numberPattern.exec(text)?.[1];

    return number === undefined ? undefined : Number(number);
  }
}
