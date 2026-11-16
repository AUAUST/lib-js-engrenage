import { custom } from "valibot";

import { isFunction } from "@auaust/toolkit";

import type { EffectModuleResolver } from "#project/structure/types/EffectModuleResolver";

export const effectModuleResolverSchema = custom<EffectModuleResolver>(
  isFunction,
);
