import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";
import type { EnvironmentKindEntry } from "#project/environments/ports/EnvironmentKindEntry";
import type { NamespaceKindEntry } from "#project/environments/ports/NamespaceKindEntry";

export interface ContributedEnvironmentEntry {
  readonly entry: EnvironmentEntry;
  readonly kind: EnvironmentKindEntry;
  /**
   * The namespace kind named like the environment, giving the boundary facts of
   * the top-level namespace it covers.
   */
  readonly namespace: NamespaceKindEntry;
}
