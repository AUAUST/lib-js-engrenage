import type { EffectModule } from "#batiment/roles/types/EffectModule";

export type EffectModuleResolver = (
  specifier: string,
) => EffectModule | undefined;
