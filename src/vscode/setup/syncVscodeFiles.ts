import { array, optional, string } from "valibot";

import { deduplicate, flatMap, includes } from "@auaust/primitive-kit/arrays";

import { emptyObjectFile } from "#support/json/constants";
import { applyJsonEdits } from "#support/json/utils/applyJsonEdits";
import { flattenJsonObject } from "#support/json/utils/flattenJsonObject";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import { validate } from "#utils/validate";
import { extensionsFile, settingsFile } from "#vscode/constants";
import { findIntegrations } from "#vscode/utils/findIntegrations";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

function addRecommendations(
  content: string,
  path: File,
  extensions: ReadonlyArray<string>,
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
        {
          isArrayInsertion: true,
        },
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

export function syncVscodeFiles(
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

  const edits = flatMap(applicable, (integration) => {
    return flattenJsonObject(integration.settings);
  });

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
        edits,
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
