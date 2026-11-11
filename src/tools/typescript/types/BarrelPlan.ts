import type { StructureNode } from "#project/structure/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";
import type { File } from "#types/File";

export interface BarrelPlan {
  readonly file: File;
  readonly node: StructureNode;
  readonly modules: readonly BarrelModule[];
  readonly reexports: readonly BarrelExport[];
}
