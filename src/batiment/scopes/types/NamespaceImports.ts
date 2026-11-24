import type { NamespaceRelation } from "#batiment/scopes/types/NamespaceRelation";

/**
 * The top-level namespaces of its scope a namespace imports, by name or kind
 * name, with the relation each is imported through.
 */
export type NamespaceImports = Readonly<Record<string, NamespaceRelation>>;
