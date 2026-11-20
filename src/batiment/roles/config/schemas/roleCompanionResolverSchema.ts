import { custom } from "valibot";

import { isFunction } from "@auaust/toolkit";

import type { RoleCompanionResolver } from "#batiment/roles/types/RoleCompanionResolver";

export const roleCompanionResolverSchema = custom<RoleCompanionResolver>(
  isFunction,
);
