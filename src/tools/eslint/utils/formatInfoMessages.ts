import type { InfoMessage } from "#tools/eslint/types/InfoMessage";
import type { File } from "#types/File";

export function formatInfoMessages(
  file: File,
  messages: readonly InfoMessage[],
): string | undefined {
  if (messages.length === 0) {
    return;
  }

  return [
    "Lint suggestions for the file you edited; apply those that fit.",
    ...messages.map(({ line, column, message, ruleId }) => {
      return `${file}:${line}:${column} ${message} (${ruleId})`;
    }),
  ].join("\n");
}
