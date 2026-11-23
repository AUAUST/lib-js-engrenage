import type { AgentRuntime } from "#metalbrain/runtimes/ports/AgentRuntime";
import type { LoadedConfig } from "#project/config/index";

/**
 * Lists the agent runtimes the active extensions contribute.
 */
export async function getAgentRuntimes(
  config: LoadedConfig,
): Promise<readonly AgentRuntime[]> {
  const contributions = await config.context.registry.contributions(
    "agents.runtimes",
    config,
  );

  return contributions.map(({ entry }) => entry);
}
