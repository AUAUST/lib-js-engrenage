import type { HookEvent } from "#tools/agents/types/HookEvent";

export interface HookDefinition {
  readonly event: HookEvent;
  readonly matcher: string;
  readonly command: string;
  readonly condition?: string;
}
