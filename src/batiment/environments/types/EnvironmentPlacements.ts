import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The registered environment placed on each directory, covering its subtree, and
 * on each root-relative file, in registration order.
 */
export interface EnvironmentPlacements {
  readonly dirs: Readonly<Record<Directory, string>>;
  readonly files: Readonly<Record<File, string>>;
}
