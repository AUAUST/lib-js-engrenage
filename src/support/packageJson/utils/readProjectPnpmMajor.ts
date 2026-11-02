import { parseMajorVersion } from "#support/packageJson/utils/parseMajorVersion";
import { readProjectPnpmVersion } from "#support/packageJson/utils/readProjectPnpmVersion";
import type { PackageJson } from "#support/packageJson/types/PackageJson";

export function readProjectPnpmMajor(
  packageJson: PackageJson,
): number | undefined {
  const version = readProjectPnpmVersion(packageJson);

  return version === undefined ? undefined : parseMajorVersion(version);
}
