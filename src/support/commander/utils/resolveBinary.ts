import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

import { isString } from "@auaust/toolkit/isString";
import { get } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { resolve } from "#support/filesystem/utils/resolve";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

function isModuleNotFound(error: unknown): boolean {
  return error instanceof Error && get(error, "code") === "MODULE_NOT_FOUND";
}

function resolveManifest(
  config: ResolvedConfig,
  packageName: KnownPackageName,
): File {
  const require = createRequire(config.resolve(packageJsonFile));

  try {
    return require.resolve(`${packageName}/${packageJsonFile}`);
  } catch (error) {
    if (!isModuleNotFound(error)) {
      throw error;
    }

    throw new Error(`Install ${packageName} in ${config.root} to run it`, {
      cause: error,
    });
  }
}

export function resolveBinary(
  config: ResolvedConfig,
  packageName: KnownPackageName,
  binary: string,
): File {
  const manifestPath = resolveManifest(config, packageName);

  const directory = dirname(manifestPath);

  const { bin } = createPackageJson({
    root: directory,
    path: manifestPath,
    content: readFileSync(manifestPath, "utf-8"),
  });

  const path = isString(bin) ? bin : bin[binary];

  if (path === undefined) {
    throw new Error(`${manifestPath} declares no "${binary}" binary`);
  }

  return resolve(directory, path);
}
