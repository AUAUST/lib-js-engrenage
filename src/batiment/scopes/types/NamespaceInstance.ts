import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";
import type { Directories } from "#types/Directories";

/**
 * A top-level namespace of a scope, with the namespace kind giving its
 * boundary facts.
 */
export interface NamespaceInstance {
  /**
   * The namespace ID: its name, prefixed by its scope outside the root.
   */
  readonly id: string;
  /**
   * The key of the scope holding the namespace.
   */
  readonly scope: string;
  readonly name: string;
  /**
   * Describes the namespace's files as an import category in the project map.
   */
  readonly title: string;
  readonly kind: NamespaceKind;
  readonly dirs: Directories;
}
