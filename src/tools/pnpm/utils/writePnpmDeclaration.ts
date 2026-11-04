import { wrap } from "@auaust/primitive-kit/arrays";

import { writePackageJsonValue } from "#package/utils/writePackageJsonValue";
import type { PackageJson } from "#package/types/PackageJson";
import type { File } from "#types/File";

export function writePnpmDeclaration(
  content: string,
  path: File,
  packageJson: PackageJson,
  version: string,
): string {
  const [declared, ...others] = wrap(
    packageJson.optional.devEngines?.packageManager,
  );

  if (others.length > 0) {
    throw new Error(
      `${path} lists several devEngines.packageManager entries: update the pnpm one by hand`,
    );
  }

  const current = declared?.name === "pnpm" ? declared : undefined;

  return writePackageJsonValue(
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
}
