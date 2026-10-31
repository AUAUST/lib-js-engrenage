import { entries } from "@auaust/toolkit/object";

import { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { PathAliases } from "#typescript/types/PathAliases";
import type { Paths } from "#typescript/types/Paths";

export function resolveSourceEntries(config: ResolvedConfig): PathAliases {
  const { packageJson, root, src, tsconfig } = config;
  const { name } = packageJson;

  if (src.exports === undefined) {
    return resolvePathAliases(name, tsconfig.paths, root);
  }

  const paths: Paths = {};

  for (const [subpath, target] of entries(src.exports)) {
    if (subpath !== "." && !subpath.startsWith("./")) {
      throw new Error(
        `Invalid src.exports subpath '${subpath}': it must be '.' or start with './'`,
      );
    }

    paths[subpath === "." ? name : `${name}/${subpath.slice(2)}`] = [target];
  }

  return resolvePathAliases(name, paths, root);
}
