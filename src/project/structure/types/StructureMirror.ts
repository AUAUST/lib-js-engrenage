import type { Directory } from "#types/Directory";

/** @experimental */
export interface StructureMirror {
  readonly environment: string;
  readonly path: Directory;
}
