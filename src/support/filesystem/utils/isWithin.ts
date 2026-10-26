import { isAbsolute, relative, sep } from "node:path";

import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";

export function isWithin(base: Directory | URL, path: string): boolean {
  const pathFromBase = relative(resolve(base), resolve(base, path));

  return (
    pathFromBase !== ".." &&
    !pathFromBase.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromBase)
  );
}
