import { parseAssistantMessages } from "#metalbrain/runtimes/hooks/utils/parseAssistantMessages";
import type { AssistantMessage } from "#metalbrain/runtimes/types/AssistantMessage";

/**
 * Finds, in transcript lines, the assistant message issuing a tool use and the
 * assistant message before it.
 */
export function findIssuingMessage(
  text: string,
  toolUse: string,
): { issuing: AssistantMessage; previous?: AssistantMessage } | undefined {
  const messages = parseAssistantMessages(text);

  const index = messages.findIndex(({ toolUses }) => {
    return toolUses.includes(toolUse);
  });

  if (index === -1) {
    return;
  }

  const issuing = messages[index].message;

  const previous = messages[index - 1]?.message;

  return { issuing, ...(previous === undefined ? {} : { previous }) };
}
