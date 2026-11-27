import type { EffectCeilings } from "#batiment/effects/index";
import type { ResolvedRoleContract, RoleLocation } from "#batiment/roles/index";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { StructureKind } from "#batiment/structure/types/StructureKind";
import type { Directory } from "#types/Directory";

/**
 * Where a file sits in the project: its scope key, its top-level namespace ID or
 * `dist`, `undefined` in a scope outside every namespace of it, the directory
 * and kind of its nearest structure node, the namespaces and domains above it,
 * its nearest domain with that domain's public specifiers and collected roles,
 * the roles its enclosing domains make public in their subtree, and the role
 * and contract it holds, if any. `variant` names the test variant of a file in
 * a namespace holding tests, `environment` the ID of the registered environment
 * its placements give it, if any.
 */
export interface Entity {
  readonly scope: string;
  readonly namespace: string | undefined;
  readonly path: Directory;
  readonly kind: StructureKind | undefined;
  readonly group: boolean;
  readonly lineage: readonly LineageMember[];
  readonly location: RoleLocation;
  readonly domain: string | undefined;
  readonly surface: readonly string[];
  readonly collects: readonly string[];
  readonly publicRoles: readonly string[];
  readonly role: string | undefined;
  readonly fileRole: string | undefined;
  readonly contract: ResolvedRoleContract | undefined;
  readonly effects: EffectCeilings | undefined;
  readonly public: boolean;
  readonly variant: string | undefined;
  readonly environment: string | undefined;
}
