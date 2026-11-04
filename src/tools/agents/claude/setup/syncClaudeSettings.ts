import { isDeepStrictEqual } from "node:util";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { jsonIndentation } from "#project/format/constants";
import {
  claudeEditHook,
  claudeGithubHook,
  claudeHiddenAttribution,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { syncHook } from "#tools/agents/operations/syncHook";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

function syncAttribution(
  config: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  attribution: boolean,
) {
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
  config: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
    agents: ResolvedAgents;
  },
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

  for (const hook of [claudeEditHook, claudeGithubHook]) {
    syncHook(config, {
      file: claudeSettingsFile,
      hook,
    });
  }

  if (attribution !== undefined) {
    syncAttribution(config, attribution);
  }
}
