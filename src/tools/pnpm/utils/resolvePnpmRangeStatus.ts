import {
  compareVersions,
  parseVersion,
  readDeclaredVersion,
  readProjectPnpmVersion,
  readSharedPnpmRange,
  type PackageJson,
} from "#project/package/index";

export function resolvePnpmRangeStatus(
  packageJson: PackageJson,
): "missing" | "invalid" | "below" | "within" | "above" {
  const specifier = readProjectPnpmVersion(packageJson);

  if (specifier === undefined) {
    return "missing";
  }

  const { floor } = readSharedPnpmRange();

  const shared = parseVersion(floor);
  const declared = parseVersion(specifier);

  if (declared === undefined || shared === undefined) {
    return "invalid";
  }

  if (declared.major !== shared.major) {
    return declared.major < shared.major ? "below" : "above";
  }

  const version = readDeclaredVersion(specifier);

  return version !== undefined && compareVersions(version, floor) < 0
    ? "below"
    : "within";
}
