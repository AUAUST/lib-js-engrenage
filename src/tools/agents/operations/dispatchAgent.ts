import { loadLazy } from "#foundation/modules/index";
import { checkAgentDispatch } from "#tools/agents/operations/checkAgentDispatch";
import { createDispatchEnvironment } from "#tools/agents/utils/createDispatchEnvironment";
import type { AgentDispatch, AgentReport } from "#metalbrain/runtimes/index";
import type { LoadedConfig } from "#project/config/index";

/**
 * Runs an agent headless in another checkout through the client of the runtime
 * the caller names, after the readiness check a dispatch from this checkout gets,
 * since the run's own hooks see no dispatch.
 */
export async function dispatchAgent(
  config: LoadedConfig,
  client: string,
  dispatch: Omit<AgentDispatch, "environment">,
): Promise<AgentReport> {
  const runtimes = await config.context.registry.contributions(
    "agents.runtimes",
    config,
  );

  const contribution = runtimes.find(({ entry }) => entry.name === client);

  if (contribution === undefined) {
    const names = runtimes.map(({ entry }) => entry.name);

    throw new Error(
      `No active extension contributes the ${client} agent runtime; expected one of: ${names.length === 0 ? "none" : names.join(", ")}`,
    );
  }

  const { dispatcher, title = client } = contribution.entry;

  if (dispatcher === undefined) {
    throw new Error(`${title} cannot run agents headless`);
  }

  if ("agent" in dispatch.run) {
    // @debt checks the brief against the caller's issue contract names, while the target checkout's own config may name them differently
    const reason = await checkAgentDispatch(
      config,
      dispatch.run.agent,
      dispatch.brief,
      dispatch.directory,
    );

    if (reason !== undefined) {
      throw new Error(reason);
    }
  }

  const run = await loadLazy(dispatcher);

  return run({
    ...dispatch,
    environment: createDispatchEnvironment(process.env),
  });
}
