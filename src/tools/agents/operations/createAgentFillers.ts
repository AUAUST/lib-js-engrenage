import type { LoadedConfig } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";

export async function createAgentFillers(
  config: LoadedConfig,
): Promise<BlockFillers> {
  const contributions = await config.context.registry.contributions(
    "agents.fillers",
    config,
  );

  const fillers: BlockFillers = {};

  for (const { entry, extension } of contributions) {
    if (entry.name in fillers) {
      throw new Error(
        `Agent filler "@${entry.name}" is contributed twice, the second time by ${extension.name}`,
      );
    }

    fillers[entry.name] = async (...args) => {
      const fill = await entry.load();

      return fill(config, ...args);
    };
  }

  return fillers;
}
