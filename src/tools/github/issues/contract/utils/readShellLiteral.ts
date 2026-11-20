import type { ShellWord } from "#foundation/shell/index";

export function readShellLiteral(
  word: ShellWord | undefined,
): string | undefined {
  return word?.kind === "literal" ? word.text : undefined;
}
