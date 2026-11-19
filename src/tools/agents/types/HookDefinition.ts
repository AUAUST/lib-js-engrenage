import type { HookEvent } from "#tools/agents/types/HookEvent";

/**
 * A command hook sync writes into an agent runtime's hook settings, running the
 * hook program with `args`.
 */
export interface HookDefinition {
  readonly event: HookEvent;
  readonly matcher: string;
  readonly args: string;
  readonly async?: true;
}
