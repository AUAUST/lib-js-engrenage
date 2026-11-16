import { freeze } from "@auaust/toolkit/object";

import type { Role } from "#project/roles/types/Role";

/**
 * Declares a project's own role, frozen. For a role other projects override,
 * create a preset with `createRolePreset` instead.
 */
export function role(definition: Role): Readonly<Role> {
  return freeze(definition);
}
