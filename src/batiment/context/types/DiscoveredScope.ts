import type { ScopeRegistry } from "#batiment/context/types/ScopeRegistry";
import type { Directory } from "#types/Directory";

/**
 * A scope's directory, `.` for the root, with its registry.
 */
export interface DiscoveredScope {
  readonly dir: Directory;
  readonly registry: ScopeRegistry;
}
