import { claudeFile, claudeSettingsFile } from "#tools/agents/claude/constants";
import { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
import type { Step } from "#project/steps/types/Step";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function createClaudeSettingsStep(): Step<{
  agents: ResolvedAgents;
  resolve(...paths: string[]): string;
}> {
  return {
    name: claudeSettingsFile,
    message: "Fix, format and lint the files Claude Code edits with a hook?",
    isMissing({ get, filesystem }) {
      const agents = get("agents");

      return (
        agents.preferred?.includes("claude") === true &&
        agents.claudeSettings !== false &&
        filesystem.exists(claudeFile) &&
        !filesystem.exists(claudeSettingsFile)
      );
    },
    plan({ get, filesystem }) {
      syncClaudeSettings(
        {
          filesystem,
          resolve: get("resolve"),
          agents: get("agents"),
        },
        {
          settings: true,
        },
      );
    },
  };
}
