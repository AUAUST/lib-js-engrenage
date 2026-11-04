import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#tools/agents/constants";
import { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

export function getMissingRuleTemplates(config: ResolvedConfig) {
  const references = getRuleReferences(config);
  const owned = new Set<string>(values(attributionRules));

  return getRuleTemplates().filter(({ name, file, reference }) => {
    return (
      !owned.has(name) &&
      !config.filesystem.exists(file) &&
      !references.has(reference)
    );
  });
}
