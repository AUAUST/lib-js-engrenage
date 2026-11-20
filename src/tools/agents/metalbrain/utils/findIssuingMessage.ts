import { isFiniteNumber } from "#tools/agents/metalbrain/utils/isFiniteNumber";
import { isRecord } from "#tools/agents/metalbrain/utils/isRecord";
import { isText } from "#tools/agents/metalbrain/utils/isText";
import { measureContext } from "#tools/agents/metalbrain/utils/measureContext";
import type { AssistantMessage } from "#tools/agents/metalbrain/types/AssistantMessage";
import type { MessageTokens } from "#tools/agents/metalbrain/types/MessageTokens";

const syntheticModel = "<synthetic>";

function parseLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}

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

function issues(content: unknown, toolUse: string): boolean {
  return (
    Array.isArray(content) &&
    content.some((block: unknown) => {
      return (
        isRecord(block) && block.type === "tool_use" && block.id === toolUse
      );
    })
  );
}

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract, restating the usage reading of `readClaudeTranscript`
/**
 * Finds, in transcript lines, the assistant message issuing a tool use and the
 * assistant message before it. A message spans several entries, the last one
 * carrying its final usage.
 */
export function findIssuingMessage(
  text: string,
  toolUse: string,
): { issuing: AssistantMessage; previous?: AssistantMessage } | undefined {
  const messages = new Map<string, AssistantMessage>();

  let issuing: string | undefined;

  for (const line of text.split("\n")) {
    const entry = parseLine(line);

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
      id,
      model,
      ...(isText(usage.speed) ? { speed: usage.speed } : {}),
      tokens,
      context: measureContext(tokens),
    });

    if (issuing === undefined && issues(message.content, toolUse)) {
      issuing = id;
    }
  }

  if (issuing === undefined) {
    return;
  }

  const found = messages.get(issuing);

  if (found === undefined) {
    return;
  }

  const ordered = [...messages.values()];

  const previous = ordered[ordered.indexOf(found) - 1];

  return {
    issuing: found,
    ...(previous === undefined ? {} : { previous }),
  };
}
