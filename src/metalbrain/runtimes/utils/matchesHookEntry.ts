import { createHookCommand } from "#metalbrain/runtimes/utils/createHookCommand";
import type { HookDefinition } from "#metalbrain/runtimes/types/HookDefinition";
import type { HookRoots } from "#metalbrain/runtimes/types/HookRoots";

export function matchesHookEntry(
  entry: {
    readonly command?: string | undefined;
    readonly if?: string | undefined;
    readonly onFailure?: string | undefined;
    readonly async?: boolean | undefined;
  },
  hook: HookDefinition,
  roots: HookRoots,
): boolean {
  return (
    entry.command === createHookCommand(hook.args, roots, hook.program) &&
    entry.if === undefined &&
    entry.onFailure === undefined &&
    entry.async === hook.async
  );
}
