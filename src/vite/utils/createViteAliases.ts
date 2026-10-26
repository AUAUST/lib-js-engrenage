import { map } from "@auaust/primitive-kit/arrays";

import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { PathAlias } from "#typescript/types/PathAlias";
import type { Alias } from "#vite/types/Alias";

export function createViteAliases(
  pathAliases: PathAlias[],
  root: Directory | URL,
): Alias[] {
  return map(pathAliases, ({ alias, path }) => {
    return {
      find: new RegExp(`^${RegExp.escape(alias)}$`),
      replacement: resolve(root, path),
    };
  });
}
