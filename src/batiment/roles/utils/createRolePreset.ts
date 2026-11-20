import { role } from "#batiment/roles/utils/role";
import type { Role } from "#batiment/roles/types/Role";
import type { RolePreset } from "#batiment/roles/types/RolePreset";

/**
 * Creates a role preset declaring a role with `defaults`, for a project or an
 * extension to declare its own roles.
 */
export function createRolePreset(defaults: Role): RolePreset {
  return function preset(options = {}) {
    return role({ ...defaults, ...options });
  };
}
