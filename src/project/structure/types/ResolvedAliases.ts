import type { Alias } from "#structure/types/Alias";

export interface ResolvedAliases {
  readonly enabled: boolean;
  readonly global: readonly Alias[];
  readonly src: readonly Alias[];
}
