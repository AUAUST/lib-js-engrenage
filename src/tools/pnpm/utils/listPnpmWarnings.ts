import {
  readProjectPnpmVersion,
  readSharedPnpmRange,
  type PackageJson,
} from "#project/package/index";
import { onlyAllowScript, upgradeCommand } from "#tools/pnpm/constants";
import { resolvePnpmRangeStatus } from "#tools/pnpm/utils/resolvePnpmRangeStatus";

export function listPnpmWarnings(packageJson: PackageJson): string[] {
  const { packageManager, scripts } = packageJson.optional;

  const warnings: string[] = [];

  const status = resolvePnpmRangeStatus(packageJson);
  const version = readProjectPnpmVersion(packageJson);
  const { range } = readSharedPnpmRange();

  if (status === "invalid") {
    throw new Error(
      `pnpm ${version} cannot be compared with engrenage's pnpm ${range}: one has no version`,
    );
  }

  if (status === "missing") {
    warnings.push(
      `devEngines.packageManager does not declare pnpm: run \`${upgradeCommand}\``,
    );
  } else if (status === "below") {
    warnings.push(
      `pnpm ${version} is below engrenage's pnpm ${range}: run \`${upgradeCommand}\``,
    );
  } else if (status === "above") {
    warnings.push(
      `pnpm ${version} is above engrenage's pnpm ${range}: update engrenage`,
    );
  }

  if (packageManager !== undefined) {
    warnings.push(
      `the legacy packageManager field is still declared: run \`${upgradeCommand}\``,
    );
  }

  if (scripts?.["preinstall"] === onlyAllowScript) {
    warnings.push(
      `the "${onlyAllowScript}" preinstall script is obsolete: run \`${upgradeCommand}\``,
    );
  }

  return warnings;
}
