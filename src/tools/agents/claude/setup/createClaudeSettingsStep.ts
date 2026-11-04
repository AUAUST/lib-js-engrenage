import { claudeFile, claudeSettingsFile } from "#tools/agents/claude/constants";
import { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
import type { Step } from "#project/steps/types/Step";

export function createClaudeSettingsStep(): Step {
  return {
    name: claudeSettingsFile,
    message: "Fix, format and lint the files Claude Code edits with a hook?",
    isMissing({ config, filesystem }) {
      return (
        config.agents.preferred?.includes("claude") === true &&
        config.agents.claudeSettings !== false &&
        filesystem.exists(claudeFile) &&
        !filesystem.exists(claudeSettingsFile)
      );
    },
    plan({ config }) {
      syncClaudeSettings(config, {
        settings: true,
      });
    },
  };
}
