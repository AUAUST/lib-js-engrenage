import { isDeepStrictEqual } from "node:util";

import {
  claudeEditHook,
  claudeEditHookCommand,
  claudeHiddenAttribution,
  claudeSettingsFile,
} from "#agents/claude/constants";
import { syncEditHook } from "#agents/utils/syncEditHook";
import { emptyObjectFile } from "#support/json/constants";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

function syncAttribution(config: ResolvedConfig, attribution: boolean) {
  const path = config.resolve(claudeSettingsFile);
  const location = ["attribution"];
  const content = config.filesystem.read(claudeSettingsFile) ?? emptyObjectFile;

  const hidden = isDeepStrictEqual(
    readJsonValue(content, path, location),
    claudeHiddenAttribution,
  );

  if (attribution && hidden) {
    config.filesystem.write(
      claudeSettingsFile,
      writeJsonValue(content, path, location, undefined),
    );
  } else if (!attribution && !hidden) {
    config.filesystem.write(
      claudeSettingsFile,
      writeJsonValue(content, path, location, claudeHiddenAttribution),
    );
  }
}

export function syncClaudeSettings(
  config: ResolvedConfig,
  { settings = false }: { settings?: boolean } = {},
) {
  const { claudeSettings: configured, attribution } = config.agents;

  if (
    config.agents.preferred?.includes("claude") !== true ||
    configured === false ||
    !(
      configured === true ||
      settings ||
      attribution === false ||
      config.filesystem.exists(claudeSettingsFile)
    )
  ) {
    return;
  }

  syncEditHook(config, {
    file: claudeSettingsFile,
    matcher: claudeEditHook.matcher,
    command: claudeEditHookCommand,
  });

  if (attribution !== undefined) {
    syncAttribution(config, attribution);
  }
}
