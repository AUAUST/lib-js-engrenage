import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * An `.environment.json` placing the registered `environment` on `dir`.
 */
export interface DiscoveredEnvironment {
  readonly dir: Directory;
  readonly file: File;
  readonly environment: string;
}
