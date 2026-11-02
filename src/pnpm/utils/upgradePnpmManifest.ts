import { wrap } from "@auaust/primitive-kit/arrays";

import { onlyAllowScript } from "#pnpm/constants";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import { writePackageJsonValue } from "#support/packageJson/utils/writePackageJsonValue";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { File } from "#types/File";

export function upgradePnpmManifest(
  content: string,
  path: File,
  packageJson: PackageJson,
  version: string,
): string {
  const { devEngines, packageManager, scripts } = packageJson.optional;

  const [declared, ...others] = wrap(devEngines?.packageManager);

  if (others.length > 0) {
    throw new Error(
      `${path} lists several devEngines.packageManager entries: update the pnpm one by hand`,
    );
  }

  const current = declared?.name === "pnpm" ? declared : undefined;

  let upgraded = writePackageJsonValue(
    content,
    path,
    ["devEngines", "packageManager"],
    {
      ...current,
      name: "pnpm",
      version: `^${version}`,
      onFail: current?.onFail ?? "download",
    },
  );

  if (packageManager !== undefined) {
    upgraded = writeJsonValue(upgraded, path, ["packageManager"], undefined);
  }

  if (scripts?.["preinstall"] === onlyAllowScript) {
    upgraded = writeJsonValue(
      upgraded,
      path,
      ["scripts", "preinstall"],
      undefined,
    );
  }

  return upgraded;
}
