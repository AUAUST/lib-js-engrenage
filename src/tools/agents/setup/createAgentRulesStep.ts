import { filterMap, pluck } from "@auaust/primitive-kit/arrays";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import type { Step } from "#project/steps/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function createAgentRulesStep(): Step<{ agents: ResolvedAgents }> {
  return {
    name: "agent rules",
    message: "Choose shared coding rules for .claude/rules/?",
    async isMissing({ get, filesystem }) {
      const agents = await get("agents");

      if ((agents.preferred?.length ?? 0) === 0) {
        return false;
      }

      const missing = await getMissingRuleTemplates({ filesystem });

      return missing.some((template) => template.default);
    },
    async plan({ get, filesystem, multiselect }) {
      const templates = await getMissingRuleTemplates({ filesystem });

      const missing = templates.filter(({ name }) => name !== "backlog");

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, "default", "name"),
      );

      await addAgentRules({ filesystem, agents: await get("agents") }, names);
    },
  };
}
