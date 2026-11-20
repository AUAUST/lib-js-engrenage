import type { Directory } from "#types/Directory";

/**
 * The directory of another environment a `tests` directory mirrors.
 *
 * @experimental
 */
export interface StructureMirror {
  readonly environment: string;
  readonly path: Directory;
}
