import type { ThoroughnessLevel } from "#metalbrain/runtimes/types/ThoroughnessLevel";

/**
 * The token limit of each thoroughness level: the context an agent may gain over
 * its first call before it is warned.
 */
export interface ThoroughnessLimits {
  readonly levels: Readonly<Record<ThoroughnessLevel, number>>;
}
