import { resolveExportPaths } from "#package/utils/resolveExportPaths";
import { resolvePathAliases } from "#tsconfig/operations/resolvePathAliases";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { PathAliases } from "#tsconfig/types/PathAliases";

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
