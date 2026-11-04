import { parseMajorVersion } from "#package/utils/parseMajorVersion";
import { readProjectPnpmVersion } from "#package/utils/readProjectPnpmVersion";
import type { PackageJson } from "#package/types/PackageJson";

export function readProjectPnpmMajor(
  packageJson: PackageJson,
): number | undefined {
  const version = readProjectPnpmVersion(packageJson);

  return version === undefined ? undefined : parseMajorVersion(version);
}
