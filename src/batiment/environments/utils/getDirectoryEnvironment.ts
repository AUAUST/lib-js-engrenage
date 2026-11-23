import { posix } from "node:path";

import { getOwn } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { Directory } from "#types/Directory";

/**
 * The environment of the nearest directory placement at or above `dir`,
 * relative to the scope root.
 */
export function getDirectoryEnvironment(
  { dirs }: EnvironmentPlacements,
  dir: Directory,
): string | undefined {
  for (
    let current = dir;
    current !== rootScope && current !== "";
    current = posix.dirname(current)
  ) {
    const environment = getOwn(dirs, current);

    if (environment !== undefined) {
      return environment;
    }
  }
}
