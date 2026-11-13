import type { RoleLocation } from "#project/roles/types/RoleLocation";
import type { File } from "#types/File";

/**
 * A module of a role: its project-relative file, its file name without extension
 * and its location.
 *
 * @experimental
 */
export interface RoleModule {
  readonly file: File;
  readonly name: string;
  readonly location: RoleLocation;
}
