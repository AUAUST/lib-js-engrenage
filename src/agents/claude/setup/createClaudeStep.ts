import { claudeFile } from "#agents/claude/constants";
import { agentsFile } from "#agents/constants";
import type { Step } from "#support/scaffold/types/Step";

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
