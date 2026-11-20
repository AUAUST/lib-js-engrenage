import type { HookContext } from "#tools/agents/metalbrain/types/HookContext";
import type { ToolPayload } from "#tools/agents/metalbrain/types/ToolPayload";

export type HookAction = (
  payload: ToolPayload,
  context: HookContext,
) => Promise<void>;
