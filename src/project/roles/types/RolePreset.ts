import type { Role } from "#project/roles/types/Role";

/**
 * Builds a frozen role from the preset's defaults, each given option replacing
 * its field.
 */
export type RolePreset = (options?: Partial<Role>) => Role;
