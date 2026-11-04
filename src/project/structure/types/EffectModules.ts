import type { EffectModuleResolver } from "#project/structure/types/EffectModuleResolver";

export type EffectModules =
  Readonly<Record<string, string>> | EffectModuleResolver;
