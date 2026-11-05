import { isDeepStrictEqual } from "node:util";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue, writeJsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import {
  claudeEditHook,
  claudeGithubHook,
  claudeHiddenAttribution,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { syncHook } from "#tools/agents/operations/syncHook";
import type { Filesystem } from "#foundation/filesystem/index";
import type { OptionContext } from "#foundation/options/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

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
  { get }: OptionContext<AgentSections>,
  { settings = false }: { settings?: boolean } = {},
) {
  const config = {
    filesystem: await get("filesystem"),
    resolve: await get("resolve"),
    agents: await get("agents"),
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

  for (const hook of [claudeEditHook, claudeGithubHook]) {
    await syncHook(config, {
      file: claudeSettingsFile,
      hook,
    });
  }

  if (attribution !== undefined) {
    await syncAttribution(config, attribution);
  }
}
