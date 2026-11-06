import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

export interface Entity {
  readonly environment:
    StructureEnvironmentName | "data" | "dist" | "workspace";
  readonly workspace: Glob | undefined;
  readonly path: Directory;
  readonly kind: StructureKind | undefined;
  readonly commands: boolean;
  readonly namespace:
    { readonly path: Directory; readonly isolated: boolean } | undefined;
  readonly layer: number | undefined;
  readonly domain: string | undefined;
  readonly surface: readonly string[];
  readonly role: string | undefined;
  readonly fileRole: string | undefined;
  readonly contract: ResolvedRoleContract | undefined;
  readonly effects: string | undefined;
  readonly public: boolean;
  readonly variant: TestVariant | undefined;
}
