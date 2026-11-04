import type { StructureEnvironmentName } from "#structure/types/StructureEnvironmentName";
import type { StructureNode } from "#structure/types/StructureNode";
import type { Directories } from "#types/Directories";

export interface EnvironmentStructure {
  readonly name: StructureEnvironmentName;
  readonly dirs: Directories;
  readonly strictness: "strict" | "loose";
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
}
