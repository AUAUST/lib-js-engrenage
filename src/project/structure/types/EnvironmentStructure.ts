import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureRole } from "#project/structure/types/StructureRole";
import type { Directories } from "#types/Directories";

export interface EnvironmentStructure {
  readonly name: StructureEnvironmentName;
  readonly dirs: Directories;
  readonly indexFile: string;
  readonly entryFile: string | undefined;
  readonly strictness: "strict" | "loose";
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
  readonly roles: Readonly<Record<string, StructureRole>>;
}
