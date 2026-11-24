import { sort } from "@auaust/toolkit/array";

import { rootScope } from "#batiment/scopes/constants";
import type { Directory } from "#types/Directory";

/**
 * Creates the lookup of the scope a root-relative path belongs to: the nearest
 * of `scopes` at or above it, else the root.
 */
export function createScopeFinder(
  scopes: Iterable<Directory>,
): (path: string) => Directory {
  const nearestFirst = sort(
    [...scopes].filter((scope) => scope !== rootScope),
    (left, right) => right.length - left.length,
  );

  return function findScope(path) {
    return (
      nearestFirst.find((scope) => {
        return path === scope || path.startsWith(`${scope}/`);
      }) ?? rootScope
    );
  };
}
