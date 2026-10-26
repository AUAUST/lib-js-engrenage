import { entries } from "@auaust/toolkit/object";

import type { Entries } from "#tsdown/types/Entries";
import type { PathAlias } from "#typescript/types/PathAlias";

export function createTsdownEntries(
  pathAliases: PathAlias[],
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
