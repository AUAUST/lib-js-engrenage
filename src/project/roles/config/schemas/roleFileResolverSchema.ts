import { custom } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";

import type { RoleFileResolver } from "#project/roles/types/RoleFileResolver";

export const roleFileResolverSchema = custom<RoleFileResolver>(isFunction);
