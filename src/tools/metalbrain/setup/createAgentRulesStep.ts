import { filterMap, pluck } from "@auaust/toolkit/array";

import {
  addAgentRules,
  getMissingRuleTemplates,
} from "#metalbrain/instructions/index";
import { hasPreferredAgents } from "#metalbrain/runtimes/index";
import { loadAgentInputs } from "#tools/metalbrain/operations/loadAgentInputs";
import type { Step } from "#project/steps/index";

export function createAgentRulesStep(): Step {
  return {
    name: "agent rules",
    message: "Choose shared coding rules for .claude/rules/?",
    async isMissing(context) {
      const agents = await context.resolve("agents");

      if (!hasPreferredAgents(agents)) {
        return false;
      }

      const missing = await getMissingRuleTemplates(
        await loadAgentInputs(context),
      );

      return missing.some((template) => template.default);
    },
    async plan(context) {
      const { multiselect } = context;

      const inputs = await loadAgentInputs(context);

      const templates = await getMissingRuleTemplates(inputs);

      const missing = templates.filter(({ name }) => name !== "backlog");

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, (template) => template.default, "name"),
      );

      await addAgentRules(inputs, names);
    },
  };
}
