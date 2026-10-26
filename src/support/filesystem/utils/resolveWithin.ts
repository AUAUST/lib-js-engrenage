import { sep } from "node:path";

import { isWithin } from "#support/filesystem/utils/isWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";

export function resolveWithin(
  base: Directory | URL,
  ...paths: string[]
): string {
  const basePath = resolve(base);

  const path = resolve(basePath, ...paths);

  if (!isWithin(basePath, path)) {
    throw new Error(`Path "${paths.join(sep)}" escapes ${basePath}`);
  }

  return path;
}
