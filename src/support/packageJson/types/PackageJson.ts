import type { Accessors } from "#support/accessors/types/Accessors";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";
import type { SubpathImports } from "#typescript/types/SubpathImports";

export type PackageJson = Accessors<{
  path: File | undefined;
  manifest: Record<string, unknown> | undefined;
  name: PackageName | undefined;
  imports: SubpathImports | undefined;
}>;
