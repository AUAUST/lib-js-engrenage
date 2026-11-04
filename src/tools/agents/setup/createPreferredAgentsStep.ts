import { agentNames } from "#tools/agents/constants";
import type { Step } from "#project/steps/types/Step";

export function createPreferredAgentsStep(): Step {
  return {
    name: "preferred agents",
    isMissing({ getAgents }) {
      return getAgents() === undefined;
    },
    async plan({ config, multiselect, setAgents }) {
      const chosen = await multiselect(
        "Which coding agents do you use?",
        agentNames,
      );

      setAgents(chosen);

      if (config.configFile !== undefined) {
        console.info(
          `Add agents.preferred: ${JSON.stringify(chosen)} to ${config.configFile} to persist the preferences.`,
        );
      }
    },
  };
}
