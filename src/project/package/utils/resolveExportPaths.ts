import { entries } from "@auaust/toolkit/object";

import type { Paths } from "#project/tsconfig/index";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

/**
 * Maps each exposed subpath to the specifier consumers import it by, `.` to
 * `packageName` and `./sub` to `packageName/sub`, targeting its file. Throws
 * when a subpath is neither `.` nor starts with `./`.
 */
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
