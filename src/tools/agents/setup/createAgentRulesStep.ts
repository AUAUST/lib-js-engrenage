import { filterMap, pluck } from "@auaust/primitive-kit/arrays";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import type { Step } from "#project/steps/index";

export function createAgentRulesStep(): Step {
  return {
    name: "agent rules",
    message: "Choose shared coding rules for .claude/rules/?",
    async isMissing(context) {
      const agents = await context.resolve("agents");

      if ((agents.preferred?.length ?? 0) === 0) {
        return false;
      }

      const missing = await getMissingRuleTemplates({
        filesystem: context.filesystem,
        // @debt consider caching the fillers to avoid recomputing them in plan()
        fillers: await createAgentFillers(context),
      });

      return missing.some((template) => template.default);
    },
    async plan(context) {
      const { resolve, filesystem, multiselect } = context;

      const fillers = await createAgentFillers(context);

      const templates = await getMissingRuleTemplates({
        filesystem,
        fillers,
      });

      const missing = templates.filter(({ name }) => name !== "backlog");

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, "default", "name"),
      );

      await addAgentRules(
        {
          filesystem,
          agents: await resolve("agents"),
          fillers,
        },
        names,
      );
    },
  };
}
