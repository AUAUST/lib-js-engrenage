import type { EnvironmentKind } from "#batiment/environments/ports/EnvironmentKind";

/**
 * An environment declared in a scope, with the kind giving its nature.
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
}
