import {
  compareVersions,
  parseMajorVersion,
  readDeclaredVersion,
  readProjectPnpmVersion,
  readSharedPnpmRange,
  type PackageJson,
} from "#project/package/index";

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

  // @debt an unparseable project or shared pnpm specifier counts as within the range instead of being reported
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
