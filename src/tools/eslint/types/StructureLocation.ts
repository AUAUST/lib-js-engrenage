import type { ResolvedRoleContract, StructureEnvironmentName , StructureNode  } from "#project/structure/index";

export interface StructureLocation {
  readonly environment: StructureEnvironmentName;
  readonly root: StructureNode;
  readonly indexFile: string;
  readonly node: StructureNode;
  readonly contract: ResolvedRoleContract | undefined;
  readonly relativePath: string;
}
