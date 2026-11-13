import type { RoleLocation } from "#project/roles/index";
import type { LineageMember } from "#project/structure/types/LineageMember";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

/**
 * Where a file sits in the project: its environment, `workspace` or `dist`, the
 * directory and kind of its nearest structure node, the namespaces and domains
 * above it, its nearest domain with that domain's public specifiers and collected
 * roles, and the role and contract it holds, if any. `variant` is set only for
 * test files.
 */
export interface Entity {
  readonly environment: string;
  readonly workspace: Glob | undefined;
  readonly path: Directory;
  readonly kind: StructureKind | undefined;
  readonly commands: boolean;
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
