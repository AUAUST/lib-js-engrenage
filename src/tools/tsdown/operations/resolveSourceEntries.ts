import { resolveExportPaths, type PackageJson } from "#project/package/index";
import {
  resolvePathAliases,
  type PathAliases,
  type Tsconfig,
} from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function resolveSourceEntries({
  packageJson,
  root,
  exposed,
  tsconfig,
}: {
  packageJson: PackageJson;
  root: Directory;
  exposed: Readonly<Record<string, File>> | undefined;
  tsconfig: Tsconfig;
}): Promise<PathAliases> {
  const { name } = packageJson;

  return resolvePathAliases(
    name,
    exposed === undefined ? tsconfig.paths : resolveExportPaths(name, exposed),
    root,
  );
}
