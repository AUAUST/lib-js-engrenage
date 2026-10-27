import type { Filesystem } from "#config/types/Filesystem";
import type { PackageJson } from "#support/packageJson/types/PackageJson";

export interface DefineContext {
  packageJson: PackageJson;
  filesystem: Filesystem;
}
