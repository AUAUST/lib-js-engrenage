import type { EnvironmentKind } from "#batiment/environments/ports/EnvironmentKind";

/**
 * An environment declared in a scope, with the kind giving its nature.
 */
export interface EnvironmentInstance {
  readonly name: string;
  readonly title: string;
  readonly kind: EnvironmentKind;
}
