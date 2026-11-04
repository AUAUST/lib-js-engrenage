import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { Directories } from "#types/Directories";

export interface EnvironmentStructure {
  readonly name: StructureEnvironmentName;
  readonly dirs: Directories;
  readonly indexFile: string;
  readonly strictness: "strict" | "loose";
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
}
