import { filterMap, pluck } from "@auaust/toolkit/array";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
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

      const missing = await getMissingRuleTemplates({
        filesystem: context.filesystem,
        extensions: await listActiveExtensions(context),
        renderer: await createFragmentRenderer(context),
      });

      return missing.some((template) => template.default);
    },
    async plan(context) {
      const { filesystem, multiselect } = context;

      const templates = await getMissingRuleTemplates({
        filesystem,
        extensions: await listActiveExtensions(context),
        renderer: await createFragmentRenderer(context),
      });

      const missing = templates.filter(({ name }) => name !== "backlog");

      const names = await multiselect(
        "Choose rules to add",
        pluck(missing, "name"),
        filterMap(missing, (template) => template.default, "name"),
      );

      await addAgentRules(context, names);
    },
  };
}
