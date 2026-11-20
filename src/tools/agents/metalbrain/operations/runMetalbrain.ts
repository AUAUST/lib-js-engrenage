import { logToolCall } from "#tools/agents/metalbrain/operations/logToolCall";
import { recordCallStart } from "#tools/agents/metalbrain/operations/recordCallStart";
import { parseToolPayload } from "#tools/agents/metalbrain/utils/parseToolPayload";
import type { HookAction } from "#tools/agents/metalbrain/types/HookAction";
import type { HookContext } from "#tools/agents/metalbrain/types/HookContext";

const claudeHookActions: Readonly<Record<string, readonly HookAction[]>> = {
  PreToolUse: [recordCallStart],
  PostToolUse: [logToolCall],
};

/**
 * Runs `metalbrain hook claude <event>` on the event's payload: each action the
 * event lists, in order. Fails on any other command or event.
 */
export async function runMetalbrain(
  args: readonly string[],
  input: string,
  context: HookContext,
): Promise<void> {
  const [command, runtime, event = ""] = args;

  const actions = command === "hook" && runtime === "claude"
    ? claudeHookActions[event]
    : undefined;

  if (actions === undefined) {
    throw new Error(`metalbrain: unknown command '${args.join(" ")}'`);
  }

  const payload = parseToolPayload(JSON.parse(input));

  for (const action of actions) {
    await action(payload, context);
  }
}
