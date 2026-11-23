import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface DiscoveredEnvironment {
  readonly dir: Directory;
  readonly file: File;
  readonly languages?: readonly string[];
}
