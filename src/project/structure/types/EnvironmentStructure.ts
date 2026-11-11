import type { EnvironmentFileNames } from "#project/structure/types/EnvironmentFileNames";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureRole } from "#project/structure/types/StructureRole";
import type { Directories } from "#types/Directories";

/** @experimental */
export interface EnvironmentStructure extends EnvironmentFileNames {
  readonly name: string;
  readonly dirs: Directories;
  readonly strictness: "strict" | "loose";
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
  readonly roles: Readonly<Record<string, StructureRole>>;
}
