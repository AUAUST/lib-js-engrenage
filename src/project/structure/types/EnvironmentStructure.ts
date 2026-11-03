import type { StructureEnvironment } from "#project/structure/types/StructureEnvironment";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { Directories } from "#types/Directories";

export interface EnvironmentStructure {
  readonly name: StructureEnvironment;
  readonly dirs: Directories;
  readonly strictness: "strict" | "loose";
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
}
