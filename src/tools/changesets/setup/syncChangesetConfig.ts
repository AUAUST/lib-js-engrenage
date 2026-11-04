import { createRequire } from "node:module";

import { object, string } from "valibot";

import { syncFiles } from "#blocks/utils/syncFiles";
import { configFile } from "#changesets/constants";
import { changesetsCli, changesetsConfig, packageJsonFile } from "#constants";
import { readJsonFile } from "#filesystem/utils/readJsonFile";
import { applyJsonEdits } from "#json/utils/applyJsonEdits";
import { flattenJsonObject } from "#json/utils/flattenJsonObject";
import { validate } from "#options/utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
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
        return applyJsonEdits(content, path, options);
      },
    },
  ]);
}
