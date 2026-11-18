import type { RoleLocation } from "#project/roles/index";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureSource } from "#project/structure/types/StructureSource";

export interface StructureParent {
  readonly kind: StructureKind | "root";
  readonly layers: readonly string[] | undefined;
  readonly childKind?: "domains";
  readonly scopes: readonly string[];
  readonly owned: readonly string[];
  readonly structured: boolean;
  readonly source: StructureSource;
  readonly location: RoleLocation;
  readonly mirrored?: {
    readonly environment: string;
    readonly subpath: string;
  };
}
