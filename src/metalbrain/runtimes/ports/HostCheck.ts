import type { HookContext } from "#metalbrain/runtimes/types/HookContext";

/**
 * Host code a hook event runs on the runtime's raw hook `payload`, `context.root`
 * being the main worktree's counterpart of the project the hook runs in.
 */
export type HostCheck = (
  payload: unknown,
  context: HookContext,
) => Promise<void>;
