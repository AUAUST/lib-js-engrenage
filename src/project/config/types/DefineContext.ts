import type { Filesystem } from "#filesystem/types/Filesystem";
import type { PackageJson } from "#package/types/PackageJson";

export interface DefineContext {
  packageJson: PackageJson;
  filesystem: Filesystem;
}
