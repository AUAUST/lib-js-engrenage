import type { Directory } from "#types/Directory";
import type { PathAlias } from "#typescript/types/PathAlias";
import { resolvePath } from "#utils/resolvePath";
import type { Alias } from "#vite/types/Alias";
import { map } from "@auaust/primitive-kit/arrays";

export function createViteAliases(
  pathAliases: PathAlias[],
  root: Directory | URL,
): Alias[] {
  return map(pathAliases, ({ alias, path }) => {
    return {
      find: new RegExp(`^${RegExp.escape(alias)}$`),
      replacement: resolvePath(root, path),
    };
  });
}
