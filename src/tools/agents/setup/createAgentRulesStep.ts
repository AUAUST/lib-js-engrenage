import { filterMap, pluck } from "@auaust/primitive-kit/arrays";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { agentsSection } from "#tools/agents/operations/agentsSection";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import type { Step } from "#project/steps/index";

export function createAgentRulesStep(): Step {
  return {
    name: "agent rules",
    message: "Choose shared coding rules for .claude/rules/?",
    async isMissing({ resolve, filesystem }) {
      const agents = await resolve(agentsSection);

      if ((agents.preferred?.length ?? 0) === 0) {
        return false;
      }

      const missing = await getMissingRuleTemplates({ filesystem });

      return missing.some((template) => template.default);
    },
    async plan({ resolve, filesystem, multiselect }) {
      const templates = await getMissingRuleTemplates({ filesystem });

      const missing = templates.filter(({ name }) => name !== "backlog");

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, "default", "name"),
      );

      await addAgentRules(
        { filesystem, agents: await resolve(agentsSection) },
        names,
      );
    },
  };
}
