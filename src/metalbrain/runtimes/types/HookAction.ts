import type { HookContext } from "#metalbrain/runtimes/types/HookContext";
import type { ToolPayload } from "#metalbrain/runtimes/types/ToolPayload";

/**
 * A hook action: runs on a tool hook payload and returns a context for the
 * agent, or nothing.
 */
export type HookAction = (
  payload: ToolPayload,
  context: HookContext,
) => Promise<string | undefined>;
