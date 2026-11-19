import { sep } from "node:path";

import type { Directory } from "#types/Directory";

// @debt repeats the `node_modules` cut the generated hook command makes in shell (`createHookCommand`); the config lookup itself could skip dependencies instead
/**
 * Cuts a hook payload's `cwd` before its first `node_modules` segment, so the
 * config lookup starting there finds the project instead of a dependency.
 */
export function resolveHookDirectory(cwd: Directory): Directory {
  const segments = cwd.split(sep);

  const dependencies = segments.indexOf("node_modules");

  if (dependencies === -1) {
    return cwd;
  }

  return segments.slice(0, dependencies).join(sep) || sep;
}
