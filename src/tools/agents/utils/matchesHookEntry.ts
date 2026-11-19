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
    entry.command === createHookCommand(hook.args) &&
    entry.if === undefined &&
    entry.onFailure === undefined &&
    entry.async === hook.async
  );
}
