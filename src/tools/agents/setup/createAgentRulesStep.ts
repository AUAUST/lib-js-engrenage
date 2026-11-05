import { filterMap, pluck } from "@auaust/primitive-kit/arrays";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import type { Step } from "#project/steps/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function createAgentRulesStep(): Step<{ agents: ResolvedAgents }> {
  return {
    name: "agent rules",
    message: "Choose shared coding rules for .claude/rules/?",
    isMissing({ get, filesystem }) {
      return (
        (get("agents").preferred?.length ?? 0) > 0 &&
        getMissingRuleTemplates({ filesystem }).some(
          (template) => template.default,
        )
      );
    },
    async plan({ get, filesystem, multiselect }) {
      const missing = getMissingRuleTemplates({ filesystem }).filter(
        ({ name }) => {
          return name !== "backlog";
        },
      );

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, "default", "name"),
      );

      addAgentRules({ filesystem, agents: get("agents") }, names);
    },
  };
}
