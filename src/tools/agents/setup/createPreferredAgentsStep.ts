import { map } from "@auaust/primitive-kit/arrays";

import type { Step } from "#project/steps/index";

export function createPreferredAgentsStep(): Step {
  return {
    name: "preferred agents",
    isMissing({ getAgents }) {
      return getAgents() === undefined;
    },
    async plan(step) {
      const { context, multiselect, setAgents } = step;

      const runtimes = await context.registry.contributions(
        "agents.runtimes",
        step,
      );

      const chosen = await multiselect(
        "Which coding agents do you use?",
        map(runtimes, ({ entry }) => entry.name),
      );

      setAgents(chosen);

      if (context.configFile !== undefined) {
        console.info(
          `Add agents.preferred: ${JSON.stringify(chosen)} to ${context.configFile} to persist the preferences.`,
        );
      }
    },
  };
}
