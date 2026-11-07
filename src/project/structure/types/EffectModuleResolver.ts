import type { EffectModule } from "#project/structure/types/EffectModule";

export type EffectModuleResolver = (
  specifier: string,
) => EffectModule | undefined;
