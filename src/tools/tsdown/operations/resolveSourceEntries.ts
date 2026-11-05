import { resolveExportPaths, type PackageJson } from "#project/package/index";
import {
  resolvePathAliases,
  type PathAliases,
  type Tsconfig,
} from "#project/tsconfig/index";
import type { ResolvedSource } from "#project/environments/index";
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
