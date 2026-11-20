import type { Alias } from "#batiment/structure/types/Alias";

export interface ResolvedAliases {
  readonly enabled: boolean;
  readonly global: readonly Alias[];
  readonly src: readonly Alias[];
}
