import { entries } from "@auaust/toolkit/object";

import type { Paths } from "#tsconfig/types/Paths";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

export function resolveExportPaths(
  packageName: PackageName,
  exposed: Readonly<Record<string, File>>,
): Paths {
  const paths: Paths = {};

  for (const [subpath, target] of entries(exposed)) {
    if (subpath !== "." && !subpath.startsWith("./")) {
      throw new Error(
        `Invalid src.exports subpath '${subpath}': it must be '.' or start with './'`,
      );
    }

    paths[
      subpath === "." ? packageName : `${packageName}/${subpath.slice(2)}`
    ] = [target];
  }

  return paths;
}
