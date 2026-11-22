import type { HookContext } from "#metalbrain/runtimes/types/HookContext";
import type { HookVerdict } from "#metalbrain/runtimes/types/HookVerdict";

/**
 * Host code a hook event runs on the runtime's raw hook `payload`, `context.root`
 * being the main worktree's counterpart of the project the hook runs in. The
 * hook renders the verdict it returns in the runtime's output format.
 */
export type HostCheck = (
  payload: unknown,
  context: HookContext,
) => Promise<HookVerdict | undefined>;
