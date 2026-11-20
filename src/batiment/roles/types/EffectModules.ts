import type { EffectModule } from "#batiment/roles/types/EffectModule";
import type { EffectModuleResolver } from "#batiment/roles/types/EffectModuleResolver";

export type EffectModules =
  | Readonly<Record<string, EffectModule>>
  | EffectModuleResolver;
