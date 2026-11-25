import type { RoleLocation } from "#batiment/roles/index";
import type { MirrorRoot } from "#batiment/structure/types/MirrorRoot";
import type { StructureKind } from "#batiment/structure/types/StructureKind";
import type { StructureSource } from "#batiment/structure/types/StructureSource";

export interface StructureParent {
  readonly kind: StructureKind | "root";
  readonly layers: readonly string[] | undefined;
  readonly childKind?: "domains";
  readonly scopes: readonly string[];
  readonly owned: readonly string[];
  readonly structured: boolean;
  readonly source: StructureSource;
  readonly location: RoleLocation;
  readonly mirrored?: MirrorRoot & {
    readonly subpath: string;
  };
}
