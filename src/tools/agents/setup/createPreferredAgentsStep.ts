import { agentNames } from "#tools/agents/constants";
import type { Step } from "#project/steps/index";

export function createPreferredAgentsStep(): Step {
  return {
    name: "preferred agents",
    isMissing({ getAgents }) {
      return getAgents() === undefined;
    },
    async plan({ context, multiselect, setAgents }) {
      const configFile = context.configFile;

      const chosen = await multiselect(
        "Which coding agents do you use?",
        agentNames,
      );

      setAgents(chosen);

      if (configFile !== undefined) {
        console.info(
          `Add agents.preferred: ${JSON.stringify(chosen)} to ${configFile} to persist the preferences.`,
        );
      }
    },
  };
}
