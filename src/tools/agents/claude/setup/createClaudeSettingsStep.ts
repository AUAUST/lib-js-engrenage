import {
  claudeFile,
  claudeHooks,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
import { agentsSection } from "#tools/agents/config/sections/agentsSection";
import type { Step } from "#project/steps/index";

export function createClaudeSettingsStep(): Step {
  return {
    name: claudeSettingsFile,
    message: `Check ${claudeHooks.map(({ condition }) => condition).join(", ")} commands with a Claude Code hook?`,
    async isMissing({ resolve, filesystem }) {
      const agents = await resolve(agentsSection);

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
