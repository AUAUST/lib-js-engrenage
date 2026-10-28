import { array, optional, string } from "valibot";

import {
  deduplicate,
  flatMap,
  includes,
  map,
} from "@auaust/primitive-kit/arrays";

import { loadInfoRules } from "#eslint/utils/loadInfoRules";
import { emptyObjectFile } from "#support/json/constants";
import { applyJsonEdits } from "#support/json/utils/applyJsonEdits";
import { flattenJsonObject } from "#support/json/utils/flattenJsonObject";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import { validate } from "#utils/validate";
import {
  eslintIntegration,
  extensionsFile,
  settingsFile,
} from "#vscode/constants";
import { findIntegrations } from "#vscode/utils/findIntegrations";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { File } from "#types/File";
import type { Integration } from "#vscode/types/Integration";

function addRecommendations(
  content: string,
  path: File,
  extensions: readonly string[],
): string {
  const recommendations = validate(
    optional(array(string())),
    readJsonValue(content, path, ["recommendations"]),
    `${path} recommendations`,
  );

  let synced = content;

  for (const extension of extensions) {
    if (!includes(recommendations ?? [], extension)) {
      synced = writeJsonValue(
        synced,
        path,
        ["recommendations", -1],
        extension,
        { isArrayInsertion: true },
      );
    }
  }

  return synced;
}

function isEnabled(
  config: ResolvedConfig,
  file: File,
  configured: boolean | undefined,
  requested: boolean,
): boolean {
  if (configured === false) {
    return false;
  }

  return configured === true || requested || config.filesystem.exists(file);
}

async function createSettingsEdits(
  config: ResolvedConfig,
  applicable: readonly Integration[],
): Promise<JsonEdit[]> {
  const infoRules = includes(applicable, eslintIntegration)
    ? await loadInfoRules(config)
    : [];

  return flatMap(applicable, (integration) => {
    const edits = flattenJsonObject(integration.settings);

    if (integration !== eslintIntegration) {
      return edits;
    }

    return [
      ...edits,
      {
        path: ["eslint.rules.customizations"],
        value: map(infoRules, (rule) => {
          return {
            rule,
            severity: "info",
          };
        }),
      },
    ];
  });
}

export async function syncVscodeFiles(
  config: ResolvedConfig,
  {
    settings = false,
    extensions = false,
  }: {
    settings?: boolean;
    extensions?: boolean;
  } = {},
) {
  const { filesystem } = config;

  const applicable = findIntegrations(config.environment.hasDependency);

  const recommendations = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  if (isEnabled(config, settingsFile, config.vscode.settings, settings)) {
    filesystem.write(
      settingsFile,
      applyJsonEdits(
        filesystem.read(settingsFile) ?? emptyObjectFile,
        config.resolve(settingsFile),
        await createSettingsEdits(config, applicable),
      ),
    );
  }

  if (isEnabled(config, extensionsFile, config.vscode.extensions, extensions)) {
    filesystem.write(
      extensionsFile,
      addRecommendations(
        filesystem.read(extensionsFile) ?? emptyObjectFile,
        config.resolve(extensionsFile),
        recommendations,
      ),
    );
  }
}
