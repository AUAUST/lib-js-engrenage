import { agentsFile, claudeFile } from "#agents/constants";
import type { Step } from "#support/scaffold/types/Step";

export function createClaudeStep(): Step {
  return {
    name: claudeFile,
    message: `Create ${claudeFile} pointing Claude Code to ${agentsFile}?`,
    isMissing({ files }) {
      return !files.exists(claudeFile) && files.exists(agentsFile);
    },
    plan({ files }) {
      files.write(claudeFile, `@${agentsFile}\n`);
    },
  };
}
