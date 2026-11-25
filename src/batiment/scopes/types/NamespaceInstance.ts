import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";
import type { NamespaceImports } from "#batiment/scopes/types/NamespaceImports";
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
  /**
   * The namespaces of its scope the namespace imports besides its kind's
   * `imports`, by name, from its `.namespace.json`: each names an existing
   * namespace whose kind is not sealed.
   */
  readonly imports?: NamespaceImports;
  /**
   * The runtime and constraints the namespace maps to, from its `.namespace.json`,
   * for a namespace whose kind has no `structure`; a structured namespace's
   * purpose is its structure root's.
   */
  readonly purpose?: string;
  readonly dirs: Directories;
}
