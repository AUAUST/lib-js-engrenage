import {
  claudeFile,
  claudeHooks,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
import type { Step } from "#project/steps/index";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";

/**
 * Init step creating `.claude/settings.json` with engrenage's hooks, offered
 * when `claude` is a preferred agent, `CLAUDE.md` exists, the settings file does
 * not and `agents.claudeSettings` is not `false`.
 */
export function createClaudeSettingsStep(): Step {
  return {
    name: claudeSettingsFile,
    message: `Check ${claudeHooks
      .map(({ condition, matcher }: HookDefinition) => {
        return condition ?? matcher;
      })
      .join(", ")} commands with a Claude Code hook?`,
    async isMissing({ resolve, filesystem }) {
      const agents = await resolve("agents");

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
