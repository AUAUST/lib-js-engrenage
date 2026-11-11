import type { ResolvedRoleContract } from "#project/structure/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface BarrelModule {
  readonly file: File;
  readonly contract: ResolvedRoleContract;
  readonly domain: Directory;
}
