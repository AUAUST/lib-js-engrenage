import type { Directory } from "#types/Directory";

export interface StructureMirror {
  readonly environment: string;
  readonly path: Directory;
}
