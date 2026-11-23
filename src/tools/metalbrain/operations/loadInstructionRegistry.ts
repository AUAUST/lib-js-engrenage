import {
  createInstructionRegistry,
  type InstructionRegistry,
} from "#metalbrain/instructions/index";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";
import type { LoadedConfig } from "#project/config/index";

const registries = new WeakMap<LoadedConfig, Promise<InstructionRegistry>>();

async function buildRegistry(
  config: LoadedConfig,
): Promise<InstructionRegistry> {
  const [facts, contributions] = await Promise.all([
    loadMetalbrainFacts(config),
    config.context.registry.contributions("agents.instructions", config),
  ]);

  return createInstructionRegistry({
    facts,
    contributions: contributions.map(({ entry, extension }) => {
      if (extension.root === undefined) {
        throw new Error(
          `${extension.name} contributes the agent ${entry.kind} "${entry.name}" but declares no root shipping its body`,
        );
      }

      return { entry, origin: extension.root };
    }),
  });
}

/**
 * The instruction registry of a loaded config, built once from metalbrain's
 * built-in entries and the `agents.instructions` contributions of its active
 * extensions, each shipped under its extension's root.
 */
export function loadInstructionRegistry(
  config: LoadedConfig,
): Promise<InstructionRegistry> {
  let registry = registries.get(config);

  if (registry === undefined) {
    registry = buildRegistry(config);

    registries.set(config, registry);
  }

  return registry;
}
