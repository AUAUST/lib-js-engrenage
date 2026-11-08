import type { Entity } from "#project/structure/types/Entity";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

export interface ImportGrants {
  readonly published: boolean;
  readonly environments: Readonly<
    Partial<Record<Entity["environment"], readonly ImportCategory[]>>
  >;
  readonly data: readonly Entity["environment"][];
  readonly variants: Readonly<
    Partial<Record<TestVariant, readonly ImportCategory[]>>
  >;
  readonly workspaces: ReadonlyMap<Directory, Directories>;
}
