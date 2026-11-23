import {
  createMetalbrainFacts,
  type MetalbrainFacts,
} from "#metalbrain/facts/index";
import { listActiveExtensions } from "#tools/agents/index";
import type { LoadedConfig } from "#project/config/index";

const facts = new WeakMap<LoadedConfig, Promise<MetalbrainFacts>>();

async function buildFacts(config: LoadedConfig): Promise<MetalbrainFacts> {
  const [{ wordCaps, outputLimit }, extensions] = await Promise.all([
    config.resolve("agents"),
    listActiveExtensions(config),
  ]);

  return createMetalbrainFacts({
    wordCaps,
    outputLimit,
    extensions,
  });
}

/**
 * The manifest metalbrain renders instructions from, built once per loaded config
 * out of its `agents` section and active extensions.
 */
export function loadMetalbrainFacts(
  config: LoadedConfig,
): Promise<MetalbrainFacts> {
  let loaded = facts.get(config);

  if (loaded === undefined) {
    loaded = buildFacts(config);

    facts.set(config, loaded);
  }

  return loaded;
}
