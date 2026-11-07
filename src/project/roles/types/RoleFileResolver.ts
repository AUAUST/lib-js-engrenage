import type { RoleLocation } from "#project/roles/types/RoleLocation";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export type RoleFileResolver = (location: RoleLocation) => Glob | Globs;
