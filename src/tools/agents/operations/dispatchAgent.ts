import { loadLazy } from "#foundation/modules/index";
import { checkAgentDispatch } from "#tools/agents/operations/checkAgentDispatch";
import { createDispatchEnvironment } from "#tools/agents/utils/createDispatchEnvironment";
import type { LoadedConfig } from "#project/config/index";
import type { AgentDispatch } from "#tools/agents/types/AgentDispatch";
import type { AgentReport } from "#tools/agents/types/AgentReport";

/**
 * Runs an agent headless in another checkout through the first preferred runtime,
 * after the readiness check a dispatch from this checkout gets, since the run's
 * own hooks see no dispatch.
 */
export async function dispatchAgent(
  config: LoadedConfig,
  dispatch: Omit<AgentDispatch, "environment">,
): Promise<AgentReport> {
  const { preferred } = await config.resolve("agents");

  const runtime = preferred?.at(0);

  if (runtime === undefined) {
    throw new Error("agents.preferred names no agent runtime to dispatch with");
  }

  const runtimes = await config.context.registry.contributions(
    "agents.runtimes",
    config,
  );

  const contribution = runtimes.find(({ entry }) => entry.name === runtime);

  if (contribution === undefined) {
    throw new Error(
      `No active extension contributes the ${runtime} agent runtime`,
    );
  }

  const { dispatcher, title = runtime } = contribution.entry;

  if (dispatcher === undefined) {
    throw new Error(`${title} cannot run agents headless`);
  }

  if ("agent" in dispatch.run) {
    const { contract } = await config.resolve("github");

    const reason = await checkAgentDispatch(
      dispatch.run.agent,
      dispatch.brief,
      dispatch.directory,
      contract,
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
