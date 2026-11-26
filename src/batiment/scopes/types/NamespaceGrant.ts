import type { NamespaceRelation } from "#batiment/scopes/types/NamespaceRelation";
import type { Directories } from "#types/Directories";

/**
 * A top-level namespace's grant into another of its scope: the relation it
 * imports through and, when set, the only directories of the target it reaches,
 * relative to the project root; without `dirs`, it reaches every directory.
 */
export interface NamespaceGrant {
  readonly relation: NamespaceRelation;
  readonly dirs?: Directories;
}
