import { custom } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";

import type { RoleCompanionResolver } from "#project/roles/types/RoleCompanionResolver";

export const roleCompanionResolverSchema = custom<RoleCompanionResolver>(
  isFunction,
);
