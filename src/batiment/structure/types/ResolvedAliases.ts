import type { Alias } from "#batiment/structure/types/Alias";

export interface ResolvedAliases {
  readonly enabled: boolean;
  readonly global: readonly Alias[];
  // @debt names engrenage's `src` namespace, from its `src.aliases` option; per-scope aliases should key them by the namespace holding the package entries
  readonly src: readonly Alias[];
}
