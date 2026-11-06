import { freeze } from "@auaust/toolkit/object";

import type { Role } from "#project/roles/types/Role";
import type { RolePreset } from "#project/roles/types/RolePreset";

export function createRolePreset(defaults: Role): RolePreset {
  return function preset(options = {}) {
    return freeze({ ...defaults, ...options });
  };
}
