import { custom } from "valibot";

import { isFunction } from "@auaust/toolkit";

import type { RoleFileResolver } from "#batiment/roles/types/RoleFileResolver";

export const roleFileResolverSchema = custom<RoleFileResolver>(isFunction);
