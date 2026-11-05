import { isDeepStrictEqual } from "node:util";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue, writeJsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import {
  claudeHiddenAttribution,
  claudeHookPrefix,
  claudeHooks,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { agentsSection } from "#tools/agents/operations/agentsSection";
import { syncHooks } from "#tools/agents/operations/syncHooks";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";

async function syncAttribution(
  config: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  attribution: boolean,
) {
  const path = config.resolve(claudeSettingsFile);
  const location = ["attribution"];

  const content =
    (await config.filesystem.read(claudeSettingsFile)) ?? emptyObjectFile;

  const hidden = isDeepStrictEqual(
    readJsonValue(content, path, location),
    claudeHiddenAttribution,
  );

  if (attribution && hidden) {
    await config.filesystem.write(
      claudeSettingsFile,
      writeJsonValue(content, path, location, undefined, jsonIndentation),
    );
  } else if (!attribution && !hidden) {
    await config.filesystem.write(
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

export async function syncClaudeSettings(
  { resolve, context }: LoadedConfig,
  { settings = false }: { settings?: boolean } = {},
) {
  const config = {
    filesystem: context.filesystem,
    resolve: context.path,
    agents: await resolve(agentsSection),
  };

  const { claudeSettings: configured, attribution } = config.agents;

  if (
    config.agents.preferred?.includes("claude") !== true ||
    configured === false ||
    !(
      configured === true ||
      settings ||
      attribution === false ||
      (await config.filesystem.exists(claudeSettingsFile))
    )
  ) {
    return;
  }

  await syncHooks(config, {
    file: claudeSettingsFile,
    hooks: claudeHooks,
    prefix: claudeHookPrefix,
  });

  if (attribution !== undefined) {
    await syncAttribution(config, attribution);
  }
}
