import { freeze } from "@auaust/toolkit/object";

import type { Role } from "#project/roles/types/Role";
import type { RolePreset } from "#project/roles/types/RolePreset";

/**
 * Creates a role preset declaring a role with `defaults`, for a project or an
 * extension to declare its own roles.
 */
export function createRolePreset(defaults: Role): RolePreset {
  return function preset(options = {}) {
    return freeze({ ...defaults, ...options });
  };
}
