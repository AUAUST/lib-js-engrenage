import type { EnvironmentPlacement } from "#batiment/environments/types/EnvironmentPlacement";

/**
 * The environments covering one directory's subtree: the one placed at or
 * above it, and the directory placements nested below it, which replace it
 * in their own subtrees.
 */
export interface EnvironmentCoverage {
  readonly environment: string | undefined;
  readonly nested: readonly EnvironmentPlacement[];
}
