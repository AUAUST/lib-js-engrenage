import { claudeFile, claudeSettingsFile } from "#agents/constants";
import { syncClaudeSettings } from "#agents/setup/syncClaudeSettings";
import type { Step } from "#support/scaffold/types/Step";

export function createClaudeSettingsStep(): Step {
  return {
    name: claudeSettingsFile,
    message: "Fix, format and lint the files Claude Code edits with a hook?",
    isMissing({ config, filesystem }) {
      return (
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
