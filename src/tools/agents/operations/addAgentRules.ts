import { values } from "@auaust/toolkit/object";

import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { attributionRules } from "#tools/agents/constants";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

export function addAgentRules(
  config: ResolvedConfig,
  names: readonly string[],
) {
  const templates = getRuleTemplates();

  const owned = new Set<string>(values(attributionRules));

  for (const name of names) {
    if (owned.has(name)) {
      throw new Error(
        `The "${name}" agent rule follows the agents.attribution option; set that option and run engrenage sync instead`,
      );
    }

    if (!templates.some((template) => template.name === name)) {
      throw new Error(
        `Unknown agent rule "${name}". Available rules: ${templates.map((template) => template.name).join(", ")}`,
      );
    }
  }

  const missing = getMissingRuleTemplates(config);

  for (const { name, file, content } of missing) {
    if (names.includes(name)) {
      config.filesystem.write(file, content);
    }
  }

  syncCodexInstructions(config);
}
