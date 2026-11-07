import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";

export interface ResolvedCache {
  readonly dir: Directory;
  for(packageName: PackageName): Directory;
}
