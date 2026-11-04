import { createRequire } from "node:module";

import { object, string } from "valibot";

import { changesetsCli, changesetsConfig, packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/operations/syncFiles";
import { readJsonFile } from "#foundation/filesystem/operations/readJsonFile";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { flattenJsonObject } from "#foundation/json/utils/flattenJsonObject";
import { validate } from "#foundation/options/utils/validate";
import { jsonIndentation } from "#project/format/constants";
import { configFile } from "#tools/changesets/constants";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { File } from "#types/File";

function resolveConfigVersion(packageJsonPath: File): string {
  try {
    const cliManifest = createRequire(packageJsonPath).resolve(
      `${changesetsCli}/${packageJsonFile}`,
    );

    const configManifest = createRequire(cliManifest).resolve(
      `${changesetsConfig}/${packageJsonFile}`,
    );

    return validate(
      object({
        version: string(),
      }),
      readJsonFile(configManifest),
      configManifest,
    ).version;
  } catch (error) {
    throw new Error(
      `Cannot resolve the installed ${changesetsConfig} version from ${packageJsonPath}`,
      {
        cause: error,
      },
    );
  }
}

export function syncChangesetConfig(config: ResolvedConfig) {
  if (
    !config.environment.hasDependency(changesetsCli) ||
    !config.filesystem.exists(configFile)
  ) {
    return;
  }

  const { packageJsonPath } = config;

  // @debt repeats the "No package.json found" guard of createStepContext and createTsdownConfig
  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.root}`);
  }

  const version = resolveConfigVersion(packageJsonPath);

  const options = flattenJsonObject({
    $schema: `https://unpkg.com/${changesetsConfig}@${version}/schema.json`,
  });

  syncFiles(config, [
    {
      file: configFile,
      update(content, path) {
        return applyJsonEdits(content, path, options, jsonIndentation);
      },
    },
  ]);
}
