import type { Directory } from "#types/Directory";
import type { PathAlias } from "#typescript/types/PathAlias";
import { resolvePath } from "#utils/resolvePath";
import type { Alias } from "#vite/types/Alias";

export function createViteAliases(
  pathAliases: PathAlias[],
  root: Directory | URL,
): Alias[] {
  return pathAliases.map(({ alias, path }) => {
    return {
      find: new RegExp(`^${RegExp.escape(alias)}$`),
      replacement: resolvePath(root, path),
    };
  });
}
