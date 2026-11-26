import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";
import type { NamespaceGrant } from "#batiment/scopes/types/NamespaceGrant";
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
   * namespace whose kind is not sealed, and only directories of it.
   */
  readonly imports?: Readonly<Record<string, NamespaceGrant>>;
  /**
   * The runtime and constraints the namespace maps to, from its `.namespace.json`,
   * for a namespace whose kind has no `structure`; a structured namespace's
   * purpose is its structure root's.
   */
  readonly purpose?: string;
  /**
   * Why the namespace does not fit the project's Compass, from its
   * `.namespace.json`, for a namespace whose kind has no `structure`; a structured
   * namespace's debt is its structure root's.
   */
  readonly debt?: string;
  readonly dirs: Directories;
}
