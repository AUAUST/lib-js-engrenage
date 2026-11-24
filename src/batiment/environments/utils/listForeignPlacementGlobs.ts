import { escape } from "minimatch";

import { entries } from "@auaust/toolkit/object";

import { getEnvironmentCoverage } from "#batiment/environments/utils/getEnvironmentCoverage";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

/**
 * Lists the globs of what other environments' placements take below `dir`:
 * each directory and file placement there of another environment than the one
 * placed at or above it.
 */
export function listForeignPlacementGlobs(
  placements: EnvironmentPlacements,
  dir: Directory,
): Globs {
  const { environment, nested } = getEnvironmentCoverage(placements, dir);

  const files = entries(placements.files)
    .filter(([file, owner]) => {
      return owner !== environment && file.startsWith(`${dir}/`);
    })
    .map(([file]) => escape(file));

  return [
    ...nested
      .filter((placement) => placement.environment !== environment)
      .map((placement) => `${escape(placement.dir)}/**`),
    ...files,
  ];
}
