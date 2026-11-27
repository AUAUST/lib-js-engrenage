import { closestMatch } from "leven";

import { floor } from "@auaust/toolkit/math";

/**
 * The suggestion a usage error about the unknown `name` ends with: the closest
 * of `candidates` within a third of its length in edits, on a line of its own,
 * or nothing when none is that close.
 *
 * @pure
 */
export function suggestName(
  name: string,
  candidates: readonly string[],
): string {
  const match = closestMatch(name, candidates, {
    maxDistance: floor(name.length / 3),
  });

  return match === undefined ? "" : `\n(Did you mean ${match}?)`;
}
