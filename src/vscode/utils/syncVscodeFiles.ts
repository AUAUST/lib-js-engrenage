import { existsSync } from "node:fs";

import { array, optional, string } from "valibot";

import {
  deduplicate,
  every,
  flatMap,
  includes,
} from "@auaust/primitive-kit/arrays";

import { emptyObjectFile } from "#support/json/constants";
import { applyJsonEdits } from "#support/json/utils/applyJsonEdits";
import { flattenJsonObject } from "#support/json/utils/flattenJsonObject";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import { syncFiles } from "#utils/syncFiles";
import { validate } from "#utils/validate";
import { extensionsFile, integrations, settingsFile } from "#vscode/constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";
import type { SyncResults } from "#types/SyncResults";

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
        true,
      );
    }
  }

  return synced;
}

function isSynced(
  config: ResolvedConfig,
  enabled: boolean | undefined,
  file: File,
): boolean {
  return enabled ?? existsSync(config.resolve(file));
}

export function syncVscodeFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  const applicable = integrations.filter(({ requires }) => {
    return every(requires, (name) => config.environment.hasDependency(name));
  });

  const settings = flatMap(applicable, (integration) => {
    return flattenJsonObject(integration.settings);
  });

  const extensions = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  const files: FileSync[] = [];

  if (isSynced(config, config.vscode.settings, settingsFile)) {
    files.push({
      file: settingsFile,
      initial: emptyObjectFile,
      update(content, path) {
        return applyJsonEdits(content, path, settings);
      },
    });
  }

  if (isSynced(config, config.vscode.extensions, extensionsFile)) {
    files.push({
      file: extensionsFile,
      initial: emptyObjectFile,
      update(content, path) {
        return addRecommendations(content, path, extensions);
      },
    });
  }

  return syncFiles({
    root: config.root,
    files,
    check,
  });
}
