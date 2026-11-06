import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

export interface ImportGrants {
  readonly published: boolean;
  readonly workspaces: ReadonlyMap<Directory, Directories>;
}
