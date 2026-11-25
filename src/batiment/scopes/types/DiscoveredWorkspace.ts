import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface DiscoveredWorkspace {
  readonly dir: Directory;
  readonly file: File;
  readonly purpose?: string;
  readonly debt?: string;
  readonly remainder: Readonly<Record<string, unknown>>;
}
