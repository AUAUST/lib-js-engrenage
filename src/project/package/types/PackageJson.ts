import type { Accessors } from "#foundation/options/index";
import type { DevEngine } from "#project/package/types/DevEngine";
import type { PackageType } from "#project/package/types/PackageType";
import type { Person } from "#project/package/types/Person";
import type { PublishAccess } from "#project/package/types/PublishAccess";
import type { SubpathImports } from "#project/package/types/SubpathImports";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";
import type { PackageName } from "#types/PackageName";
import type { PackageNames } from "#types/PackageNames";

/**
 * The project's package manifest, each field read and validated on first access
 * and throwing when invalid. A field read directly throws when the manifest is
 * missing or leaves it unset; its counterpart under `optional` is `undefined`
 * instead. `dependencies` lists the names `dependencies`, `devDependencies`,
 * `optionalDependencies` and `peerDependencies` declare, and `inlinedDependencies`
 * the names that field declares.
 */
export type PackageJson = Accessors<{
  manifest: Record<string, unknown> | undefined;
  name: PackageName | undefined;
  version: string | undefined;
  private: boolean | undefined;
  description: string | undefined;
  keywords: readonly string[] | undefined;
  homepage: string | undefined;
  bugs:
    | string
    | { url?: string | undefined; email?: string | undefined }
    | undefined;
  repository: string | { url: string } | undefined;
  license: string | undefined;
  author: string | Person | undefined;
  contributors: readonly (string | Person)[] | undefined;
  type: PackageType | undefined;
  bin: File | Partial<Record<string, File>> | undefined;
  scripts: Partial<Record<string, string>> | undefined;
  imports: SubpathImports | undefined;
  main: File | undefined;
  module: File | undefined;
  types: File | undefined;
  files: Globs | undefined;
  workspaces: Globs | undefined;
  dependencies: PackageNames | undefined;
  inlinedDependencies: PackageNames | undefined;
  sideEffects: boolean | Globs | undefined;
  packageManager: string | undefined;
  engines: Partial<Record<string, string>> | undefined;
  devEngines:
    | {
        packageManager?: DevEngine | readonly DevEngine[] | undefined;
      }
    | undefined;
  publishConfig:
    | {
        access?: PublishAccess | undefined;
        provenance?: boolean | undefined;
      }
    | undefined;
}>;
