import type { HookEvent } from "#tools/agents/types/HookEvent";

/**
 * A command hook sync writes into an agent runtime's hook settings, `condition`
 * as the entry's `if` and the other fields under their own names.
 */
export interface HookDefinition {
  readonly event: HookEvent;
  readonly matcher: string;
  readonly command: string;
  readonly condition?: string;
  readonly onFailure?: "block";
  readonly async?: true;
}
