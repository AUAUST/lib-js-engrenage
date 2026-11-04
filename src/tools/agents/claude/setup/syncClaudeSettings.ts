import { isDeepStrictEqual } from "node:util";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { jsonIndentation } from "#project/format/constants";
import {
  claudeEditHook,
  claudeEditHookCommand,
  claudeHiddenAttribution,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { syncEditHook } from "#tools/agents/operations/syncEditHook";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

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
      writeJsonValue(content, path, location, undefined, jsonIndentation),
    );
  } else if (!attribution && !hidden) {
    config.filesystem.write(
      claudeSettingsFile,
      writeJsonValue(
        content,
        path,
        location,
        claudeHiddenAttribution,
        jsonIndentation,
      ),
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
