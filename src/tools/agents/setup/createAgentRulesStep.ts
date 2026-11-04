import { filterMap, pluck } from "@auaust/primitive-kit/arrays";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import type { Step } from "#project/steps/types/Step";

export function createAgentRulesStep(): Step {
  return {
    name: "agent rules",
    message: "Choose shared coding rules for .claude/rules/?",
    isMissing({ config }) {
      return (
        (config.agents.preferred?.length ?? 0) > 0 &&
        getMissingRuleTemplates(config).some((template) => template.default)
      );
    },
    async plan({ config, multiselect }) {
      const missing = getMissingRuleTemplates(config).filter(({ name }) => {
        return name !== "backlog";
      });

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, "default", "name"),
      );

      addAgentRules(config, names);
    },
  };
}
