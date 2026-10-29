import { filterMap, pluck } from "@auaust/primitive-kit/arrays";

import { addAgentRules } from "#agents/setup/addAgentRules";
import { getMissingRuleTemplates } from "#agents/utils/getMissingRuleTemplates";
import type { Step } from "#support/scaffold/types/Step";

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
        return name !== "backlog" && name !== "scratchpad";
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
