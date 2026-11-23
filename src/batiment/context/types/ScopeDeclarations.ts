import type { EnvironmentDeclarations } from "#batiment/context/types/EnvironmentDeclarations";

export interface ScopeDeclarations {
  readonly internals: boolean;
  readonly environments: readonly EnvironmentDeclarations[];
}
