import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";

/** @experimental */
export type ResolvedStructure = Readonly<
  Record<string, EnvironmentStructure | undefined>
>;
