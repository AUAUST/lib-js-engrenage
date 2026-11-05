import { claudeFile } from "#tools/agents/claude/constants";
import { agentsFile } from "#tools/agents/constants";
import type { Step } from "#project/steps/index";

export function createClaudeStep(): Step {
  return {
    name: claudeFile,
    message: `Create ${claudeFile} pointing Claude Code to ${agentsFile}?`,
    async isMissing({ filesystem, getAgents }) {
      return (
        getAgents()?.includes("claude") === true &&
        !(await filesystem.exists(claudeFile)) &&
        (await filesystem.exists(agentsFile))
      );
    },
    async plan({ filesystem }) {
      await filesystem.write(claudeFile, `@${agentsFile}\n`);
    },
  };
}
