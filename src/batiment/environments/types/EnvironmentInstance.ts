import type { EnvironmentKind } from "#batiment/environments/ports/EnvironmentKind";
import type { NamespaceKind } from "#batiment/scopes/index";

/**
 * An environment declared in a scope, with the kind giving its runtime and the
 * namespace kind giving the boundary facts of the top-level namespace it covers.
 */
export interface EnvironmentInstance {
  /**
   * The environment ID.
   */
  readonly name: string;
  /**
   * The key of the scope declaring the environment.
   */
  readonly scope: string;
  readonly title: string;
  readonly kind: EnvironmentKind;
  readonly namespace: NamespaceKind;
}
