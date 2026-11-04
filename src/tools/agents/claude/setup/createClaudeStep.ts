import { claudeFile } from "#tools/agents/claude/constants";
import { agentsFile } from "#tools/agents/constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

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
