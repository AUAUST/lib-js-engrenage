import { getMissingRuleTemplates } from "#metalbrain/instructions/index";
import { loadFragmentRenderer } from "#tools/metalbrain/operations/loadFragmentRenderer";
import { loadInstructionRegistry } from "#tools/metalbrain/operations/loadInstructionRegistry";
import type { LoadedConfig } from "#project/config/index";

/**
 * The default rule templates extensions contribute or conditions gate that the
 * project has not installed, which only init and `agents rules add` install.
 */
export async function listMissingExtensionRules(config: LoadedConfig) {
  const [instructions, renderer] = await Promise.all([
    loadInstructionRegistry(config),
    loadFragmentRenderer(config),
  ]);

  const templates = await getMissingRuleTemplates({
    filesystem: config.context.filesystem,
    instructions,
    renderer,
  });

  return templates.filter(({ default: isDefault, conditional }) => {
    return isDefault && conditional;
  });
}
