import { resolveExportPaths, type PackageJson } from "#project/package/index";
import {
  resolvePathAliases,
  type PathAliases,
  type Tsconfig,
} from "#project/tsconfig/index";
import type { ResolvedSource } from "#project/environments/index";
import type { Directory } from "#types/Directory";

export async function resolveSourceEntries({
  packageJson,
  root,
  src,
  tsconfig,
}: {
  packageJson: PackageJson;
  root: Directory;
  src: ResolvedSource;
  tsconfig: Tsconfig;
}): Promise<PathAliases> {
  const { name } = packageJson;
  const exposed = await src.exports;

  return resolvePathAliases(
    name,
    exposed === undefined ? tsconfig.paths : resolveExportPaths(name, exposed),
    root,
  );
}
