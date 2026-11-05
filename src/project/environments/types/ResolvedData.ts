import type { ResolvedRoles } from "#project/structure/index";
import type { Directories } from "#types/Directories";
import type { File } from "#types/File";

export interface ResolvedData {
  readonly active: boolean;
  readonly roles: ResolvedRoles;
  readonly dirs: Directories;
  readonly exports: Readonly<Record<string, File>>;
}
