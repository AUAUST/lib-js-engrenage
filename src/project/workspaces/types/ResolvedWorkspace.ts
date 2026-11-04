import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";
import type { PackageName } from "#types/PackageName";

export interface ResolvedWorkspace {
  readonly dir: Directory;
  readonly name: PackageName;
  readonly packageJson: File;
  readonly tsconfig: File;
  readonly entry: File | undefined;
  readonly globs: Globs;
  readonly dependencies: Directories;
}
