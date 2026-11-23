import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The `.namespace.json` of a top-level namespace, with the kind it names.
 */
export interface DiscoveredNamespace {
  readonly dir: Directory;
  readonly file: File;
  readonly kind?: string;
}
