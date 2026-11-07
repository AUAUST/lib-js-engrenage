import type { EffectModuleResolver } from "#project/structure/types/EffectModuleResolver";
import type { EffectModule } from "#project/structure/types/EffectModule";

export type EffectModules =
  Readonly<Record<string, EffectModule>> | EffectModuleResolver;
