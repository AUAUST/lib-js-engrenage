import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";

export type ResolvedStructure = Readonly<
  Record<string, EnvironmentStructure | undefined>
>;
