/**
 * What a directory of the structure is: a namespace, one of the directories a
 * namespace spans when it spans several, a domain, a role, a `tests` directory
 * mirroring another environment's, or a directory nothing classifies.
 *
 * @experimental
 */
export type StructureKind =
  | "namespace"
  | "directory"
  | "domain"
  | "role"
  | "mirror"
  | "unclassified";
