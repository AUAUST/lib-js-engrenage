import type { PathAlias } from "#typescript/types/PathAlias";
import { resolve } from "node:path";
import type { Alias } from "vite";

export function createViteAliases(
  pathAliases: PathAlias[],
  root: string,
): Alias[] {
  return pathAliases.map(({ alias, path }) => {
    return {
      find: new RegExp(`^${RegExp.escape(alias)}$`),
      replacement: resolve(root, path),
    };
  });
}
