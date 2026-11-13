/**
 * What a directory of the structure is: a namespace, a domain, a role, a `tests`
 * directory mirroring another environment's, or a directory nothing classifies.
 *
 * @experimental
 */
export type StructureKind =
  | "namespace"
  | "domain"
  | "role"
  | "mirror"
  | "unclassified";
