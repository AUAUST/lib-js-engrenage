import type { Directory } from "#types/Directory";

/**
 * The directory of another top-level namespace a `tests` directory mirrors.
 *
 * @experimental
 */
export interface StructureMirror {
  readonly namespace: string;
  readonly path: Directory;
}
