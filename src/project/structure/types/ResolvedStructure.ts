import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";

/**
 * The structure of each environment by name; `undefined` for an environment whose
 * structure is disabled or whose directories do not exist.
 *
 * @experimental
 */
export type ResolvedStructure = Readonly<
  Record<string, EnvironmentStructure | undefined>
>;
