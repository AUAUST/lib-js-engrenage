import type { HookEvent } from "#tools/agents/types/HookEvent";
import type { HookProgram } from "#tools/agents/types/HookProgram";

/**
 * A command hook sync writes into an agent runtime's hook settings, running the
 * hook `program` with `args`, `engrenage-hook` when unset.
 */
export interface HookDefinition {
  readonly event: HookEvent;
  readonly matcher: string;
  readonly args: string;
  readonly async?: true;
  readonly program?: HookProgram;
}
