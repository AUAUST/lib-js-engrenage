import {
  addAgentSkills,
  createAgentFillers,
  listActiveExtensions,
} from "#tools/agents/index";
import type { LoadedConfig } from "#project/config/index";

/**
 * Stages the shipped skills `names` into the project of `config`, as
 * `agents skills add` installs them.
 */
export async function installAgentSkills(
  config: LoadedConfig,
  names: readonly string[],
): Promise<void> {
  await addAgentSkills(
    {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
      extensions: await listActiveExtensions(config),
      fillers: await createAgentFillers(config),
      config,
    },
    names,
  );
}
