import {
  claudeEditHook,
  claudeEditHookCommand,
  claudeSettingsFile,
  legacyEditHookCommand,
} from "#agents/claude/constants";
import { syncEditHook } from "#agents/utils/syncEditHook";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function syncClaudeSettings(
  config: ResolvedConfig,
  { settings = false }: { settings?: boolean } = {},
) {
  const configured = config.agents.claudeSettings;

  if (
    config.agents.preferred?.includes("claude") !== true ||
    configured === false ||
    !(
      configured === true ||
      settings ||
      config.filesystem.exists(claudeSettingsFile)
    )
  ) {
    return;
  }

  syncEditHook(config, {
    file: claudeSettingsFile,
    matcher: claudeEditHook.matcher,
    command: claudeEditHookCommand,
    legacyCommand: legacyEditHookCommand,
  });
}
