import { createRequire } from "node:module";

import { object, string } from "valibot";

import { changesetsCli, changesetsConfig, packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { applyJsonEdits, flattenJsonObject } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { configFile } from "#tools/changesets/constants";
import type { ConfigContext } from "#project/config/index";
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

export async function syncChangesetConfig(config: ConfigContext) {
  const filesystem = await config.get("filesystem");

  const environment = await config.get("environment");

  if (
    !environment.hasDependency(changesetsCli) ||
    !(await filesystem.exists(configFile))
  ) {
    return;
  }

  const packageJsonPath = await config.get("packageJsonPath");

  // @debt repeats the "No package.json found" guard of createStepContext and createTsdownConfig
  if (packageJsonPath === undefined) {
    throw new Error(
      `No ${packageJsonFile} found in ${await config.get("root")}`,
    );
  }

  const version = await resolveConfigVersion(packageJsonPath);

  const options = flattenJsonObject({
    $schema: `https://unpkg.com/${changesetsConfig}@${version}/schema.json`,
  });

  await syncFiles(
    {
      filesystem,
      resolve: await config.get("resolve"),
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
