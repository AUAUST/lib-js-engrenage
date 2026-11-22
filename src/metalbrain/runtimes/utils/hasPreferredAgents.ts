import type { ResolvedAgents } from "#metalbrain/runtimes/types/ResolvedAgents";

/**
 * Whether `agents.preferred` names an agent, which every agent file needs.
 */
export function hasPreferredAgents({ preferred }: ResolvedAgents): boolean {
  return (preferred?.length ?? 0) > 0;
}
