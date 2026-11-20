import type { ShellWord } from "#foundation/shell/index";

export function readShellFlag(
  words: readonly ShellWord[],
  names: readonly string[],
): ShellWord | undefined {
  for (const [index, word] of words.entries()) {
    if (word.kind !== "literal") {
      continue;
    }

    if (names.includes(word.text)) {
      return words[index + 1];
    }

    const name = names.find((candidate) => {
      return (
        candidate.startsWith("--") && word.text.startsWith(`${candidate}=`)
      );
    });

    if (name !== undefined) {
      return { kind: "literal", text: word.text.slice(name.length + 1) };
    }
  }
}
