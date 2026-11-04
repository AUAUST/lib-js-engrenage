import { array, optional, string } from "valibot";

import {
  deduplicate,
  flatMap,
  includes,
  map,
} from "@auaust/primitive-kit/arrays";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { flattenJsonObject } from "#foundation/json/utils/flattenJsonObject";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { validate } from "#foundation/options/utils/validate";
import { jsonIndentation } from "#project/format/constants";
import { loadInfoRules } from "#tools/eslint/operations/loadInfoRules";
import {
  eslintIntegration,
  extensionsFile,
  settingsFile,
} from "#tools/vscode/constants";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Integration } from "#tools/vscode/types/Integration";
import type { File } from "#types/File";

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
        jsonIndentation,
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
        jsonIndentation,
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
