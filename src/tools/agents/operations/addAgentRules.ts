import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#tools/agents/constants";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { LoadedConfig } from "#project/config/index";

export async function addAgentRules(
  config: LoadedConfig,
  names: readonly string[],
) {
  const { filesystem } = config.context;

  const [extensions, renderer] = await Promise.all([
    listActiveExtensions(config),
    createFragmentRenderer(config),
  ]);

  const templates = await getRuleTemplates({ extensions, renderer });

  const owned = new Set<string>(values(attributionRules));

  for (const name of names) {
    if (owned.has(name)) {
      throw new Error(
        `The "${name}" agent rule follows the agents.attribution option; set that option and run engrenage sync instead`,
      );
    }

    if (!templates.some((template) => template.name === name)) {
      throw new Error(
        `Unknown agent rule "${name}". Available rules: ${templates
          .map((template) => {
            return template.name;
          })
          .join(", ")}`,
      );
    }
  }

  const missing = await getMissingRuleTemplates({
    filesystem,
    extensions,
    renderer,
  });

  for (const { name, file, content } of missing) {
    if (names.includes(name)) {
      await filesystem.write(file, content);
    }
  }
}
