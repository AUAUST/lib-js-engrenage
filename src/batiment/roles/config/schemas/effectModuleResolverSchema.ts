import { custom } from "valibot";

import { isFunction } from "@auaust/toolkit";

import type { EffectModuleResolver } from "#batiment/roles/types/EffectModuleResolver";

export const effectModuleResolverSchema = custom<EffectModuleResolver>(
  isFunction,
);
