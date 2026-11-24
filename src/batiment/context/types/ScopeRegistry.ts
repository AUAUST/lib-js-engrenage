import type { NamespacePlacement } from "#batiment/context/types/NamespacePlacement";
import type { EnvironmentRegistration } from "#batiment/environments/index";
import type { EnvironmentClaim } from "#batiment/scopes/index";

/**
 * A scope's top-level namespace placements and registered environments, every
 * path relative to the scope.
 */
export interface ScopeRegistry {
  readonly namespaces: readonly NamespacePlacement[];
  readonly environments: readonly EnvironmentRegistration[];
  readonly claims: Readonly<Record<string, EnvironmentClaim>>;
}
