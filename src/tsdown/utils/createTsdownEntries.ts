import { entries } from "@auaust/toolkit/object";

import type { Entries } from "#tsdown/types/Entries";
import type { PathAliases } from "#typescript/types/PathAliases";

export function createTsdownEntries(
  pathAliases: PathAliases,
  bins: Entries,
): Entries {
  const tsdownEntries: Entries = {};

  for (const { name, path } of pathAliases) {
    tsdownEntries[name] = path;
  }

  for (const [name, path] of entries(bins)) {
    const entryPath = tsdownEntries[name];

    if (entryPath !== undefined) {
      throw new Error(
        `Bin entry '${name}' conflicts with the package entry '${entryPath}'`,
      );
    }

    tsdownEntries[name] = path;
  }

  return tsdownEntries;
}
