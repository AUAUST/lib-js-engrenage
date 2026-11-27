import type { createRunOptions } from "#nexus/cli/operations/createRunOptions";
import type { DeclaredParameters } from "#nexus/cli/types/DeclaredParameters";

/**
 * The value of each run option, given at any level of a command path.
 */
export type RunOptionValues = DeclaredParameters<
  [],
  ReturnType<typeof createRunOptions>
>[0];
