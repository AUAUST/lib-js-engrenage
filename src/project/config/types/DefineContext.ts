import type { Filesystem } from "#foundation/filesystem/index";
import type { PackageJson } from "#project/package/index";

export interface DefineContext {
  packageJson: PackageJson;
  filesystem: Filesystem;
}
