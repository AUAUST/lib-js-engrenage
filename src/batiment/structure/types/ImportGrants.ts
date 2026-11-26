import type { ImportCategory } from "#batiment/structure/types/ImportCategory";
import type { Directories } from "#types/Directories";

/**
 * The import categories each namespace and test variant may not import, by ID
 * and name; `entries` lists the IDs of the root namespaces holding the package
 * entries, whose files form the `internal-aliases` category. `directories`
 * lists, by importer ID then target ID, the only directories of the target a
 * directory-scoped grant reaches; a grant absent from it reaches every one.
 */
export interface ImportGrants {
  readonly published: boolean;
  readonly namespaces: Readonly<
    Partial<Record<string, readonly ImportCategory[]>>
  >;
  readonly elements: readonly string[];
  readonly entries: readonly string[];
  readonly surface: Readonly<Partial<Record<string, readonly string[]>>>;
  readonly directories: Readonly<
    Partial<Record<string, Readonly<Partial<Record<string, Directories>>>>>
  >;
  readonly variants: Readonly<
    Partial<Record<string, readonly ImportCategory[]>>
  >;
  readonly scopes: ReadonlyMap<string, readonly string[]>;
}
