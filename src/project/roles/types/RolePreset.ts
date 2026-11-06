import type { Role } from "#project/roles/types/Role";

export type RolePreset = (options?: Partial<Role>) => Role;
