import { entries } from "@auaust/toolkit/object";

import type { PathAliases } from "#project/tsconfig/types/PathAliases";
import type { Entries } from "#tools/tsdown/types/Entries";

export function createTsdownEntries(
  pathAliases: PathAliases,
  bins: Entries,
  workspaces: Entries,
): Entries {
  const tsdownEntries: Entries = {};

  for (const { name, path } of pathAliases) {
    tsdownEntries[name] = path;
  }

  for (const [kind, extra] of [
    ["Bin", bins],
    ["Workspace", workspaces],
  ] as const) {
    for (const [name, path] of entries(extra)) {
      const entryPath = tsdownEntries[name];

      if (entryPath !== undefined) {
        throw new Error(
          `${kind} entry '${name}' conflicts with the package entry '${entryPath}'`,
        );
      }

      tsdownEntries[name] = path;
    }
  }

  return tsdownEntries;
}
