import type { verbosityFlags } from "#nexus/cli/constants";

/**
 * A run option setting the run's verbosity.
 */
export type VerbosityFlag = keyof typeof verbosityFlags;
