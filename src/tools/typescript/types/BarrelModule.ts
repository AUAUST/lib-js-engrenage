import type { ResolvedRoleContract } from "#project/structure/index";
import type { File } from "#types/File";

export interface BarrelModule {
  readonly file: File;
  readonly contract: ResolvedRoleContract;
}
