import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { PackageJson } from "#project/package/types/PackageJson";

export interface DefineContext {
  packageJson: PackageJson;
  filesystem: Filesystem;
}
