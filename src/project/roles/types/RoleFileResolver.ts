import type { RoleLocation } from "#project/roles/types/RoleLocation";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

/**
 * Lists the names or globs a file role matches in `location`.
 *
 * @experimental
 */
export type RoleFileResolver = (location: RoleLocation) => Glob | Globs;
