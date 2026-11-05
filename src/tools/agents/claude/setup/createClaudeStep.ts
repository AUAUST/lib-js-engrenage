import { claudeFile } from "#tools/agents/claude/constants";
import { agentsFile } from "#tools/agents/constants";
import type { Step } from "#project/steps/index";

export function createClaudeStep(): Step {
  return {
    name: claudeFile,
    message: `Create ${claudeFile} pointing Claude Code to ${agentsFile}?`,
    isMissing({ filesystem, getAgents }) {
      return (
        getAgents()?.includes("claude") === true &&
        !filesystem.exists(claudeFile) &&
        filesystem.exists(agentsFile)
      );
    },
    plan({ filesystem }) {
      filesystem.write(claudeFile, `@${agentsFile}\n`);
    },
  };
}
