import { hookRoots } from "#tools/metalbrain/constants";
import { getAgentRuntimes } from "#tools/metalbrain/operations/getAgentRuntimes";
import { loadFragmentRenderer } from "#tools/metalbrain/operations/loadFragmentRenderer";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";
import type { LoadedConfig } from "#project/config/index";

/**
 * The inputs metalbrain's rule, skill and agent operations take, read from a
 * loaded config: its filesystem and root, `agents` section, fragment sources,
 * fragment renderer, contributed runtimes and the hook roots.
 */
export async function loadAgentInputs(config: LoadedConfig) {
  const [agents, { fragments }, renderer, runtimes] = await Promise.all([
    config.resolve("agents"),
    loadMetalbrainFacts(config),
    loadFragmentRenderer(config),
    getAgentRuntimes(config),
  ]);

  return {
    filesystem: config.context.filesystem,
    root: config.context.root,
    agents,
    fragments,
    renderer,
    runtimes,
    roots: hookRoots,
  };
}
