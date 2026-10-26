import type { PackageName } from "#types/PackageName";

export interface Environment {
  has(name: PackageName): boolean;
}
