import { entries, freeze } from "@auaust/toolkit/object";

import { getDirectoryEnvironment } from "#batiment/environments/utils/getDirectoryEnvironment";
import type { EnvironmentCoverage } from "#batiment/environments/types/EnvironmentCoverage";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { Directory } from "#types/Directory";

/**
 * Lists the environments covering `dir`'s subtree: the one placed at or above
 * it, and the directory placements nested below it in registration order.
 */
export function getEnvironmentCoverage(
  placements: EnvironmentPlacements,
  dir: Directory,
): EnvironmentCoverage {
  return freeze({
    environment: getDirectoryEnvironment(placements, dir),
    nested: freeze(
      entries(placements.dirs)
        .filter(([placed]) => placed.startsWith(`${dir}/`))
        .map(([placed, environment]) => freeze({ environment, dir: placed })),
    ),
  });
}
