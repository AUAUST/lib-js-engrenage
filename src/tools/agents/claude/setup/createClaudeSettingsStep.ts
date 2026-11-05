import { claudeFile, claudeSettingsFile } from "#tools/agents/claude/constants";
import { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
import type { Step } from "#project/steps/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

export function createClaudeSettingsStep(): Step<AgentSections> {
  return {
    name: claudeSettingsFile,
    message: "Fix, format and lint the files Claude Code edits with a hook?",
    async isMissing({ get, filesystem }) {
      const agents = await get("agents");

      return (
        agents.preferred?.includes("claude") === true &&
        agents.claudeSettings !== false &&
        (await filesystem.exists(claudeFile)) &&
        !(await filesystem.exists(claudeSettingsFile))
      );
    },
    async plan(context) {
      await syncClaudeSettings(context, {
        settings: true,
      });
    },
  };
}
