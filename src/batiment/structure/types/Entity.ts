import type { ResolvedRoleContract, RoleLocation } from "#batiment/roles/index";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { StructureKind } from "#batiment/structure/types/StructureKind";
import type { TestVariant } from "#batiment/structure/types/TestVariant";
import type { Directory } from "#types/Directory";

/**
 * Where a file sits in the project: its scope key, its environment ID or `dist`,
 * `undefined` in a scope outside every environment of it, the directory and
 * kind of its nearest structure node, the namespaces and domains above it, its
 * nearest domain with that domain's public specifiers and collected roles, and
 * the role and contract it holds, if any. `variant` is set only for test files.
 */
export interface Entity {
  readonly scope: string;
  readonly environment: string | undefined;
  readonly path: Directory;
  readonly kind: StructureKind | undefined;
  readonly group: boolean;
  readonly lineage: readonly LineageMember[];
  readonly location: RoleLocation;
  readonly domain: string | undefined;
  readonly surface: readonly string[];
  readonly collects: readonly string[];
  readonly role: string | undefined;
  readonly fileRole: string | undefined;
  readonly contract: ResolvedRoleContract | undefined;
  readonly effects: string | undefined;
  readonly public: boolean;
  readonly variant: TestVariant | undefined;
}
