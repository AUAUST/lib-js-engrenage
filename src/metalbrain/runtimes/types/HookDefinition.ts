import type { HookEvent } from "#metalbrain/runtimes/types/HookEvent";
import type { HookProgram } from "#metalbrain/runtimes/types/HookProgram";

/**
 * A command hook sync writes into an agent runtime's hook settings, running the
 * hook `program` with `args`, `metalbrain` when unset.
 */
export interface HookDefinition {
  readonly event: HookEvent;
  readonly matcher: string;
  readonly args: string;
  readonly async?: true;
  readonly program?: HookProgram;
}
