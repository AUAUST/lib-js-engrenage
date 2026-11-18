import type { Effort } from "#tools/agents/types/Effort";
import type { Directory } from "#types/Directory";

/**
 * A headless agent run in a checkout, started for an agent or resuming
 * one of its sessions.
 */
export interface AgentDispatch {
  /**
   * Absolute checkout directory whose own instructions, agents, hooks and
   * settings the run loads.
   */
  readonly directory: Directory;
  readonly run: { readonly agent: string } | { readonly session: string };
  readonly brief: string;
  /**
   * Overrides the agent's own effort.
   */
  readonly effort: Effort | undefined;
  /**
   * Environment of the run, stripped of what the caller's client and package
   * manager set for themselves.
   */
  readonly environment: NodeJS.ProcessEnv;
}
