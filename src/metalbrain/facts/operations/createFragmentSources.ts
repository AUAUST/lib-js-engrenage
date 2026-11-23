import { filterMap, pluck } from "@auaust/toolkit/iterable";

import { resolveMetalbrainRoot } from "#metalbrain/facts/operations/resolveMetalbrainRoot";
import type { FragmentExtension } from "#metalbrain/facts/types/FragmentExtension";
import type { FragmentSources } from "#metalbrain/facts/types/FragmentSources";

/**
 * The fragment sources of the given active extensions: metalbrain's data root,
 * then each extension's package root.
 */
export function createFragmentSources(
  extensions: readonly FragmentExtension[],
): FragmentSources {
  return {
    extensions: new Set(pluck(extensions, "name")),
    origins: [
      resolveMetalbrainRoot(),
      ...filterMap(extensions, ({ root }) => {
        return root;
      }),
    ],
  };
}
