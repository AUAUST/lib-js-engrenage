import {
  bindAgentFillers,
  type FragmentRenderer,
} from "#metalbrain/instructions/index";
import { createFragmentRenderer } from "#metalbrain/runtimes/index";
import { loadInstructionRegistry } from "#tools/metalbrain/operations/loadInstructionRegistry";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";
import type { LoadedConfig } from "#project/config/index";

const renderers = new WeakMap<LoadedConfig, Promise<FragmentRenderer>>();

async function buildRenderer(config: LoadedConfig): Promise<FragmentRenderer> {
  const [facts, instructions, contributions] = await Promise.all([
    loadMetalbrainFacts(config),
    loadInstructionRegistry(config),
    config.context.registry.contributions("agents.fillers", config),
  ]);

  return createFragmentRenderer({
    facts,
    instructions,
    fillers: bindAgentFillers(contributions, config),
    filesystem: config.context.filesystem,
  });
}

/**
 * The renderer of agent instruction fragments, built once per loaded config from
 * its manifest, its instruction registry and its contributed fillers bound to it.
 */
export function loadFragmentRenderer(
  config: LoadedConfig,
): Promise<FragmentRenderer> {
  let renderer = renderers.get(config);

  if (renderer === undefined) {
    renderer = buildRenderer(config);

    renderers.set(config, renderer);
  }

  return renderer;
}
