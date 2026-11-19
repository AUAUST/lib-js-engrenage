import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { LoadedConfig } from "#project/config/index";

/**
 * The default rule templates of active extensions the project has not installed,
 * which only init and `agents rules add` install.
 */
export async function listMissingExtensionRules(config: LoadedConfig) {
  const templates = await getMissingRuleTemplates({
    filesystem: config.context.filesystem,
    extensions: await listActiveExtensions(config),
    renderer: await createFragmentRenderer(config),
  });

  return templates.filter(({ default: isDefault, extension }) => {
    return isDefault && extension !== undefined;
  });
}
