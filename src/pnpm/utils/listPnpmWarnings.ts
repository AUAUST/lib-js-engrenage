import { onlyAllowScript, upgradeCommand } from "#pnpm/constants";
import { resolvePnpmRangeStatus } from "#pnpm/utils/resolvePnpmRangeStatus";
import { readProjectPnpmVersion } from "#support/packageJson/utils/readProjectPnpmVersion";
import { readSharedPnpmRange } from "#support/packageJson/utils/readSharedPnpmRange";
import type { PackageJson } from "#support/packageJson/types/PackageJson";

export function listPnpmWarnings(packageJson: PackageJson): string[] {
  const { packageManager, scripts } = packageJson.optional;

  const warnings: string[] = [];

  const status = resolvePnpmRangeStatus(packageJson);
  const version = readProjectPnpmVersion(packageJson);
  const { range } = readSharedPnpmRange();

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
