import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import { isAbsolute, relative, sep } from "node:path";

export function resolveWithin(
  base: Directory | URL,
  ...paths: string[]
): string {
  const basePath = resolve(base);

  const path = resolve(basePath, ...paths);

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
