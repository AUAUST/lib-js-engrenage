import { resolveExportPaths } from "#project/package/utils/resolveExportPaths";
import { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
import type { ResolvedSource } from "#project/environments/types/ResolvedSource";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { PathAliases } from "#project/tsconfig/types/PathAliases";
import type { Tsconfig } from "#project/tsconfig/types/Tsconfig";
import type { Directory } from "#types/Directory";

export function resolveSourceEntries({
  packageJson,
  root,
  src,
  tsconfig,
}: {
  packageJson: PackageJson;
  root: Directory;
  src: ResolvedSource;
  tsconfig: Tsconfig;
}): PathAliases {
  const { name } = packageJson;

  return resolvePathAliases(
    name,
    src.exports === undefined
      ? tsconfig.paths
      : resolveExportPaths(name, src.exports),
    root,
  );
}
