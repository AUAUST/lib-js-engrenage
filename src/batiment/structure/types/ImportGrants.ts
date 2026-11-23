import type { ImportCategory } from "#batiment/structure/types/ImportCategory";

/**
 * The import categories each namespace and test variant may not import, by ID
 * and name; `entries` lists the IDs of the root namespaces holding the package
 * entries, whose files form the `internal-aliases` category.
 */
export interface ImportGrants {
  readonly published: boolean;
  readonly namespaces: Readonly<
    Partial<Record<string, readonly ImportCategory[]>>
  >;
  readonly elements: readonly string[];
  readonly entries: readonly string[];
  readonly surface: Readonly<Partial<Record<string, readonly string[]>>>;
  readonly variants: Readonly<
    Partial<Record<string, readonly ImportCategory[]>>
  >;
  readonly scopes: ReadonlyMap<string, readonly string[]>;
}
