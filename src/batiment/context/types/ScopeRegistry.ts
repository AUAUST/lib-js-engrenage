import type { NamespacePlacement } from "#batiment/context/types/NamespacePlacement";
import type {
  EnvironmentPreset,
  EnvironmentRegistration,
} from "#batiment/environments/index";
import type { EnvironmentClaim, NamespaceKind } from "#batiment/scopes/index";

/**
 * A scope's namespace kinds, environment presets, top-level namespace placements
 * and registered environments, every path relative to the scope.
 */
export interface ScopeRegistry {
  readonly kinds: readonly NamespaceKind[];
  readonly presets: readonly EnvironmentPreset[];
  readonly namespaces: readonly NamespacePlacement[];
  readonly environments: readonly EnvironmentRegistration[];
  readonly claims: Readonly<Record<string, EnvironmentClaim>>;
}
