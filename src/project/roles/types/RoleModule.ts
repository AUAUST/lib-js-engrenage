import type { RoleLocation } from "#project/roles/types/RoleLocation";
import type { File } from "#types/File";

/**
 * @experimental
 */
export interface RoleModule {
  readonly file: File;
  readonly name: string;
  readonly location: RoleLocation;
}
