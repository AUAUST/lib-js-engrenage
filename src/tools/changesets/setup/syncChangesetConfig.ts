import { createRequire } from "node:module";

import { object, string } from "valibot";

import { changesetsCli, changesetsConfig, packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { applyJsonEdits, flattenJsonObject } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { accessByVisibility } from "#project/package/constants";
import {
  environmentSection,
  packageJsonPathSection,
  visibilitySection,
} from "#project/package/index";
import { traitsSection } from "#project/presets/index";
import { configFile } from "#tools/changesets/constants";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

// @debt `createRequire().resolve` walks node_modules synchronously; Node has no promise-based module resolution
async function resolveConfigVersion(packageJsonPath: File): Promise<string> {
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
      await readJsonFile(configManifest),
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

export async function syncChangesetConfig(config: LoadedConfig) {
  const filesystem = config.context.filesystem;

  const environment = await config.resolve(environmentSection);

  if (
    !environment.hasDependency(changesetsCli) ||
    !(await filesystem.exists(configFile))
  ) {
    return;
  }

  const packageJsonPath = await config.resolve(packageJsonPathSection);

  // @debt repeats the "No package.json found" guard of createStepContext and createTsdownConfig
  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.context.root}`);
  }

  const version = await resolveConfigVersion(packageJsonPath);

  const traits = await config.resolve(traitsSection);

  const options = flattenJsonObject({
    $schema: `https://unpkg.com/${changesetsConfig}@${version}/schema.json`,
    ...(traits.published && {
      access: accessByVisibility[await config.resolve(visibilitySection)],
    }),
  });

  await syncFiles(
    {
      filesystem,
      resolve: config.context.path,
    },
    [
      {
        file: configFile,
        update(content, path) {
          return applyJsonEdits(content, path, options, jsonIndentation);
        },
      },
    ],
  );
}
