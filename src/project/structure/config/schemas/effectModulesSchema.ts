import { custom, record, string, union } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";

import type { EffectModuleResolver } from "#project/structure/types/EffectModuleResolver";

export const effectModuleResolverSchema =
  custom<EffectModuleResolver>(isFunction);

export const effectModulesSchema = union([
  record(string(), string()),
  effectModuleResolverSchema,
]);
