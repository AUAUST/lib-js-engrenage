import type { verbosityLevels } from "#nexus/reports/constants";

/**
 * How much a run prints, each level showing every report the levels before it
 * in `verbosityLevels` show.
 */
export type Verbosity = (typeof verbosityLevels)[number];
