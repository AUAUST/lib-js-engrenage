import { resolveExportPaths } from "#typescript/utils/resolveExportPaths";
import { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { PathAliases } from "#typescript/types/PathAliases";

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
