import type { Directory } from "#types/Directory";
import { resolvePath } from "#utils/resolvePath";
import { isAbsolute, relative, sep } from "node:path";

export function resolveWithin(
  base: Directory | URL,
  ...paths: string[]
): string {
  const basePath = resolvePath(base);

  const path = resolvePath(basePath, ...paths);

  const pathFromBase = relative(basePath, path);

  const escapes =
    pathFromBase === ".." ||
    pathFromBase.startsWith(`..${sep}`) ||
    isAbsolute(pathFromBase);

  if (escapes) {
    throw new Error(`Path "${paths.join(sep)}" escapes ${basePath}`);
  }

  return path;
}
