import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

/**
 * The structure of each top-level namespace by name; `undefined` for one whose
 * structure is disabled or whose directories do not exist.
 *
 * @experimental
 */
export type ResolvedStructure = Readonly<
  Record<string, NamespaceStructure | undefined>
>;
