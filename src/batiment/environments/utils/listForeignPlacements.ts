import { getEnvironmentCoverage } from "#batiment/environments/utils/getEnvironmentCoverage";
import type { EnvironmentPlacement } from "#batiment/environments/types/EnvironmentPlacement";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { Directory } from "#types/Directory";

/**
 * Lists the directory placements below `dir` of another environment than the
 * one placed at or above it.
 */
export function listForeignPlacements(
  placements: EnvironmentPlacements,
  dir: Directory,
): readonly EnvironmentPlacement[] {
  const { environment, nested } = getEnvironmentCoverage(placements, dir);

  return nested.filter((placement) => placement.environment !== environment);
}
