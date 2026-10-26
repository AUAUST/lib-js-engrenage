import type { KnownPackageName } from "#types/KnownPackageName";
import type { PackageName } from "#types/PackageName";

export interface Environment {
  has(name: PackageName): name is KnownPackageName;
}
