import { sort } from "@auaust/primitive-kit/arrays";
import { record } from "@auaust/toolkit/object";

import { importPrefix } from "#tools/typescript/constants";
import type { Alias } from "#project/structure/index";

export function listSubpathImports(
  aliases: readonly Alias[],
): Record<string, string> {
  const imports = aliases
    .filter(({ key }) => key.startsWith(importPrefix))
    .map(({ key, target }) => [key, target] as const);

  return record(
    sort(imports, ([a], [b]) => {
      return a < b ? -1 : a > b ? 1 : 0;
    }),
  );
}
