import { parseMajorVersion } from "#project/package/utils/parseMajorVersion";
import { readProjectPnpmVersion } from "#project/package/utils/readProjectPnpmVersion";
import type { PackageJson } from "#project/package/types/PackageJson";

export function readProjectPnpmMajor(
  packageJson: PackageJson,
): number | undefined {
  const version = readProjectPnpmVersion(packageJson);

  return version === undefined ? undefined : parseMajorVersion(version);
}
