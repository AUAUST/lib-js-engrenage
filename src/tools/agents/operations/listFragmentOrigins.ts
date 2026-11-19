import { pathToFileURL } from "node:url";

import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import type { Extension } from "#project/config/index";

/**
 * The package roots shipping agent fragments: engrenage's, then each
 * given extension's.
 */
export function listFragmentOrigins(
  extensions: readonly Extension[],
): readonly URL[] {
  const engrenageRoot = new URL(
    ".",
    pathToFileURL(resolveDataFile(`${engrenage}/package.json`)),
  );

  return [
    engrenageRoot,
    ...extensions.flatMap(({ root }) => {
      return root === undefined ? [] : [root];
    }),
  ];
}
