import { getMissingRuleTemplates } from "#metalbrain/instructions/index";
import { loadFragmentRenderer } from "#tools/metalbrain/operations/loadFragmentRenderer";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";
import type { LoadedConfig } from "#project/config/index";

/**
 * The default rule templates of active extensions the project has not installed,
 * which only init and `agents rules add` install.
 */
export async function listMissingExtensionRules(config: LoadedConfig) {
  const [{ fragments }, renderer] = await Promise.all([
    loadMetalbrainFacts(config),
    loadFragmentRenderer(config),
  ]);

  const templates = await getMissingRuleTemplates({
    filesystem: config.context.filesystem,
    fragments,
    renderer,
  });

  return templates.filter(({ default: isDefault, extension }) => {
    return isDefault && extension !== undefined;
  });
}
