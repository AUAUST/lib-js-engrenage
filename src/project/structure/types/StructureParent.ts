import type { RoleLocationMember } from "#project/roles/index";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureKind } from "#project/structure/types/StructureKind";

export interface StructureParent {
  readonly kind: StructureKind | "root";
  readonly layers: readonly string[] | undefined;
  readonly scopes: readonly string[];
  readonly owned: readonly string[];
  readonly structured: boolean;
  readonly lineage: readonly RoleLocationMember[];
  readonly enclosing: readonly string[];
  readonly mirrored?: {
    readonly environment: StructureEnvironmentName;
    readonly subpath: string;
  };
}
