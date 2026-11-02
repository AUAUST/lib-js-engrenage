import { compareVersions } from "#support/packageJson/utils/compareVersions";
import { parseMajorVersion } from "#support/packageJson/utils/parseMajorVersion";
import { readDeclaredVersion } from "#support/packageJson/utils/readDeclaredVersion";
import { readProjectPnpmVersion } from "#support/packageJson/utils/readProjectPnpmVersion";
import { readSharedPnpmRange } from "#support/packageJson/utils/readSharedPnpmRange";
import type { PackageJson } from "#support/packageJson/types/PackageJson";

export function resolvePnpmRangeStatus(
  packageJson: PackageJson,
): "missing" | "below" | "within" | "above" {
  const specifier = readProjectPnpmVersion(packageJson);

  if (specifier === undefined) {
    return "missing";
  }

  const { floor } = readSharedPnpmRange();

  const sharedMajor = parseMajorVersion(floor);
  const major = parseMajorVersion(specifier);

  if (major === undefined || sharedMajor === undefined) {
    return "within";
  }

  if (major !== sharedMajor) {
    return major < sharedMajor ? "below" : "above";
  }

  const version = readDeclaredVersion(specifier);

  return version !== undefined && compareVersions(version, floor) < 0
    ? "below"
    : "within";
}
