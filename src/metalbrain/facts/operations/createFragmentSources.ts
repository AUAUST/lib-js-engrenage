import { pathToFileURL } from "node:url";

import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import type { FragmentExtension } from "#metalbrain/facts/types/FragmentExtension";
import type { FragmentSources } from "#metalbrain/facts/types/FragmentSources";

/**
 * The fragment sources of the given active extensions: metalbrain's data root,
 * then each extension's package root.
 */
export function createFragmentSources(
  extensions: readonly FragmentExtension[],
): FragmentSources {
  const dataRoot = new URL(
    ".",
    pathToFileURL(resolveDataFile(`${engrenage}/package.json`)),
  );

  return {
    extensions: new Set(
      extensions.map(({ name }) => {
        return name;
      }),
    ),
    origins: [
      dataRoot,
      ...extensions.flatMap(({ root }) => {
        return root === undefined ? [] : [root];
      }),
    ],
  };
}
