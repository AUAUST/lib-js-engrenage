import type { EffectModule } from "#project/structure/types/EffectModule";
import type { EffectModuleResolver } from "#project/structure/types/EffectModuleResolver";

export type EffectModules =
  | Readonly<Record<string, EffectModule>>
  | EffectModuleResolver;
