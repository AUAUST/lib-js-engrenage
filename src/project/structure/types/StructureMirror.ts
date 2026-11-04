import type { StructureEnvironmentName } from "#structure/types/StructureEnvironmentName";
import type { Directory } from "#types/Directory";

export interface StructureMirror {
  readonly environment: StructureEnvironmentName;
  readonly path: Directory;
}
