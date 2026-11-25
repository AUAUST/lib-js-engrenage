import { escape } from "minimatch";

import { entries } from "@auaust/toolkit/object";

import { getDirectoryEnvironment } from "#batiment/environments/utils/getDirectoryEnvironment";
import { listForeignPlacements } from "#batiment/environments/utils/listForeignPlacements";
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
  const environment = getDirectoryEnvironment(placements, dir);

  const files = entries(placements.files)
    .filter(([file, owner]) => {
      return owner !== environment && file.startsWith(`${dir}/`);
    })
    .map(([file]) => escape(file));

  return [
    ...listForeignPlacements(placements, dir).map((placement) => {
      return `${escape(placement.dir)}/**`;
    }),
    ...files,
  ];
}
