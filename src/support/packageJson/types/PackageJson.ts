import type { Accessors } from "#config/types/Accessors";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";
import type { PackageNames } from "#types/PackageNames";
import type { SubpathImports } from "#typescript/types/SubpathImports";

export type PackageJson = Accessors<{
  manifest: Record<string, unknown> | undefined;
  name: PackageName | undefined;
  imports: SubpathImports | undefined;
  dependencies: PackageNames | undefined;
  bin: File | Partial<Record<string, File>> | undefined;
}>;
