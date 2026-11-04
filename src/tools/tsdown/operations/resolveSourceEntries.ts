import { resolveExportPaths } from "#project/package/utils/resolveExportPaths";
import { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { PathAliases } from "#project/tsconfig/types/PathAliases";

export function resolveSourceEntries(config: ResolvedConfig): PathAliases {
  const { packageJson, root, src, tsconfig } = config;
  const { name } = packageJson;

  return resolvePathAliases(
    name,
    src.exports === undefined
      ? tsconfig.paths
      : resolveExportPaths(name, src.exports),
    root,
  );
}
