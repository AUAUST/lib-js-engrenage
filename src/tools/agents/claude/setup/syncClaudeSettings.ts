import { isDeepStrictEqual } from "node:util";

import { array, optional, string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue, writeJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import {
  claudeHiddenAttribution,
  claudeHookPrefix,
  claudeHooks,
  claudePermissions,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { agentsSection } from "#tools/agents/config/agentsSection";
import { syncHooks } from "#tools/agents/operations/syncHooks";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { SubagentCacheTtl } from "#tools/agents/types/SubagentCacheTtl";

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

async function syncPermissions(config: {
  filesystem: Filesystem;
  resolve(...paths: string[]): string;
}) {
  const path = config.resolve(claudeSettingsFile);

  let content =
    (await config.filesystem.read(claudeSettingsFile)) ?? emptyObjectFile;

  for (const [list, wanted] of entries(claudePermissions)) {
    const present =
      validate(
        optional(array(string())),
        readJsonValue(content, path, ["permissions", list]),
        `${claudeSettingsFile} permissions.${list}`,
      ) ?? [];

    for (const rule of wanted) {
      if (!present.includes(rule)) {
        content = writeJsonValue(
          content,
          path,
          ["permissions", list, -1],
          rule,
          jsonIndentation,
          { isArrayInsertion: true },
        );
      }
    }
  }

  await config.filesystem.write(claudeSettingsFile, content);
}

async function syncSubagentCacheTtl(
  config: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  ttl: SubagentCacheTtl,
) {
  const path = config.resolve(claudeSettingsFile);
  const location = ["subagentPromptCacheTtl"];

  const content =
    (await config.filesystem.read(claudeSettingsFile)) ?? emptyObjectFile;

  if (readJsonValue(content, path, location) !== ttl) {
    await config.filesystem.write(
      claudeSettingsFile,
      writeJsonValue(content, path, location, ttl, jsonIndentation),
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

  await syncPermissions(config);

  await syncSubagentCacheTtl(config, config.agents.subagentCacheTtl);

  if (attribution !== undefined) {
    await syncAttribution(config, attribution);
  }
}
