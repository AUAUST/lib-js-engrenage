import type { StructureEnvironment } from "#structure/types/StructureEnvironment";
import type { Directory } from "#types/Directory";

export interface StructureMirror {
  readonly environment: StructureEnvironment;
  readonly path: Directory;
}
