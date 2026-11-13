import { parseVersion } from "#project/package/utils/parseVersion";
import { readProjectPnpmVersion } from "#project/package/utils/readProjectPnpmVersion";
import type { PackageJson } from "#project/package/types/PackageJson";

/**
 * The major of the pnpm version `readProjectPnpmVersion` reads; `undefined` when
 * it reads none or the version holds no digit.
 */
export function readProjectPnpmMajor(
  packageJson: PackageJson,
): number | undefined {
  const version = readProjectPnpmVersion(packageJson);

  return version === undefined ? undefined : parseVersion(version)?.major;
}
