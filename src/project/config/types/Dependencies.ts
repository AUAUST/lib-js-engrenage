import type { KnownPackageName } from "#types/KnownPackageName";
import type { PackageName } from "#types/PackageName";

export interface Dependencies {
  hasDependency(name: PackageName): name is KnownPackageName;
}
