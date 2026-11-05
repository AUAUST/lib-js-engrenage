import { agentNames } from "#tools/agents/constants";
import type { Step } from "#project/steps/index";
import type { File } from "#types/File";

export function createPreferredAgentsStep(): Step<{
  configFile: File | undefined;
}> {
  return {
    name: "preferred agents",
    isMissing({ getAgents }) {
      return getAgents() === undefined;
    },
    async plan({ get, multiselect, setAgents }) {
      const configFile = await get("configFile");

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
