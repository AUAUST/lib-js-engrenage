import type { ImportCategory } from "#batiment/structure/types/ImportCategory";
import type { TestVariant } from "#batiment/structure/types/TestVariant";

export interface ImportGrants {
  readonly published: boolean;
  readonly environments: Readonly<
    Partial<Record<string, readonly ImportCategory[]>>
  >;
  readonly elements: readonly string[];
  readonly surface: Readonly<Partial<Record<string, readonly string[]>>>;
  readonly variants: Readonly<
    Partial<Record<TestVariant, readonly ImportCategory[]>>
  >;
  readonly scopes: ReadonlyMap<string, readonly string[]>;
}
