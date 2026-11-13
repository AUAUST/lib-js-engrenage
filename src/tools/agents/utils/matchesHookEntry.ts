import { createHookCommand } from "#tools/agents/utils/createHookCommand";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";

export function matchesHookEntry(
  entry: {
    readonly command?: string | undefined;
    readonly if?: string | undefined;
    readonly onFailure?: string | undefined;
    readonly async?: boolean | undefined;
  },
  hook: HookDefinition,
): boolean {
  return (
    entry.command === createHookCommand(hook.command) &&
    entry.if === hook.condition &&
    entry.onFailure === hook.onFailure &&
    entry.async === hook.async
  );
}
