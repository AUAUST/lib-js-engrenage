import type { TsdownPlugin } from "tsdown";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

// @debt bin declarations are generated and then deleted; tsdown should skip them per entry once it can
export function createOmittedDeclarationsPlugins(
  name: string,
  entries: readonly string[],
): TsdownPlugin[] {
  const omitted = new Set<string>(
    flatMap(entries, (entry) => {
      return [`${entry}.d.mts`, `${entry}.d.mts.map`];
    }),
  );

  return [
    {
      name,
      generateBundle(_options, bundle) {
        for (const fileName of keys(bundle)) {
          if (omitted.has(fileName)) {
            delete bundle[fileName];
          }
        }
      },
    },
  ];
}
