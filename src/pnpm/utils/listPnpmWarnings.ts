import { wrap } from "@auaust/primitive-kit/arrays";

import { onlyAllowScript, upgradeCommand } from "#pnpm/constants";
import { readProjectPnpmMajor } from "#support/packageJson/utils/readProjectPnpmMajor";
import { readSharedPnpmMajor } from "#support/packageJson/utils/readSharedPnpmMajor";
import type { PackageJson } from "#support/packageJson/types/PackageJson";

export function listPnpmWarnings(packageJson: PackageJson): string[] {
  const { devEngines, packageManager, scripts } = packageJson.optional;

  const warnings: string[] = [];

  const declared = wrap(devEngines?.packageManager);

  if (!declared.some(({ name }) => name === "pnpm")) {
    warnings.push(
      `devEngines.packageManager does not declare pnpm: run \`${upgradeCommand}\``,
    );
  }

  const shared = readSharedPnpmMajor();
  const major = readProjectPnpmMajor(packageJson);

  if (major !== undefined && major < shared) {
    warnings.push(
      `pnpm ${major} is behind engrenage's pnpm ${shared}: run \`${upgradeCommand}\``,
    );
  } else if (major !== undefined && major > shared) {
    warnings.push(
      `pnpm ${major} is ahead of engrenage's pnpm ${shared}: update engrenage`,
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
