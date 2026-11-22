import { isRecord } from "#metalbrain/runtimes/utils/isRecord";
import { isText } from "#metalbrain/runtimes/utils/isText";

/**
 * The text of a user transcript entry's message, joining its text blocks;
 * nothing for any other entry.
 */
export function readPromptText(entry: unknown): string | undefined {
  if (!isRecord(entry) || entry.type !== "user" || !isRecord(entry.message)) {
    return;
  }

  const { content } = entry.message;

  if (isText(content)) {
    return content;
  }

  if (!Array.isArray(content)) {
    return;
  }

  return content
    .map((block: unknown) => {
      return isRecord(block) && block.type === "text" && isText(block.text)
        ? block.text
        : "";
    })
    .join("\n");
}
