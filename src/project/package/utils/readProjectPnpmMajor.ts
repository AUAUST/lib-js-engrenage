import { parseVersion } from "#project/package/utils/parseVersion";
import { readProjectPnpmVersion } from "#project/package/utils/readProjectPnpmVersion";
import type { PackageJson } from "#project/package/types/PackageJson";

export function readProjectPnpmMajor(
  packageJson: PackageJson,
): number | undefined {
  const version = readProjectPnpmVersion(packageJson);

  return version === undefined ? undefined : parseVersion(version)?.major;
}
