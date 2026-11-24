import { join } from "node:path";

import { packageJsonFile } from "#constants";
import { readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { packageManifestSchema } from "#tools/pnpm/config/schemas/packageManifestSchema";
import type { PackageManifest } from "#tools/pnpm/types/PackageManifest";
import type { Directory } from "#types/Directory";

/**
 * The package name, executables and peer dependencies of the package
 * at `directory`.
 */
export async function readPackageManifest(
  directory: Directory,
): Promise<PackageManifest> {
  const path = join(directory, packageJsonFile);

  return validate(packageManifestSchema, await readJsonFile(path), path);
}
