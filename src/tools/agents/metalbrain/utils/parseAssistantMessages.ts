import { isFiniteNumber } from "#tools/agents/metalbrain/utils/isFiniteNumber";
import { isRecord } from "#tools/agents/metalbrain/utils/isRecord";
import { isText } from "#tools/agents/metalbrain/utils/isText";
import { measureContext } from "#tools/agents/metalbrain/utils/measureContext";
import { parseTranscriptLine } from "#tools/agents/metalbrain/utils/parseTranscriptLine";
import type { AssistantMessage } from "#tools/agents/metalbrain/types/AssistantMessage";
import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";

const syntheticModel = "<synthetic>";

function count(value: unknown): number {
  return isFiniteNumber(value) ? value : 0;
}

function readTokens(usage: Record<string, unknown>): MessageTokens {
  const written = count(usage.cache_creation_input_tokens);

  const split = isRecord(usage.cache_creation)
    ? usage.cache_creation
    : undefined;

  return {
    input: count(usage.input_tokens),
    cacheWrite5m: split === undefined
      ? written
      : count(split.ephemeral_5m_input_tokens),
    cacheWrite1h: split === undefined
      ? 0
      : count(split.ephemeral_1h_input_tokens),
    cacheRead: count(usage.cache_read_input_tokens),
    output: count(usage.output_tokens),
  };
}

function readToolUses(content: unknown): string[] {
  if (!Array.isArray(content)) {
    return [];
  }

  const toolUses: string[] = [];

  for (const block of content) {
    if (isRecord(block) && block.type === "tool_use" && isText(block.id)) {
      toolUses.push(block.id);
    }
  }

  return toolUses;
}

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract, restating the usage reading of `readClaudeTranscript`
/**
 * Reads the assistant messages of transcript lines in order, each with the
 * tool uses it issues. A message spans several entries, the last one carrying
 * its final usage.
 */
export function parseAssistantMessages(
  text: string,
): readonly { message: AssistantMessage; toolUses: readonly string[] }[] {
  const messages = new Map<
    string,
    { message: AssistantMessage; toolUses: string[] }
  >();

  for (const line of text.split("\n")) {
    const entry = parseTranscriptLine(line);

    if (!isRecord(entry) || entry.type !== "assistant") {
      continue;
    }

    const { message } = entry;

    if (
      !isRecord(message) ||
      !isText(message.id) ||
      !isText(message.model) ||
      message.model === syntheticModel ||
      !isRecord(message.usage)
    ) {
      continue;
    }

    const { id, model, usage } = message;

    const tokens = readTokens(usage);

    messages.set(id, {
      message: {
        id,
        model,
        ...(isText(usage.speed) ? { speed: usage.speed } : {}),
        tokens,
        context: measureContext(tokens),
      },
      toolUses: [
        ...(messages.get(id)?.toolUses ?? []),
        ...readToolUses(message.content),
      ],
    });
  }

  return [...messages.values()];
}
