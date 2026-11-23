import type { NamespaceKind } from "#batiment/scopes/index";
import type { ResolvedEnvironment } from "#project/environments/ports/ResolvedEnvironment";
import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export interface ContributedEnvironment extends ContributedEnvironmentEntry {
  readonly environment: ResolvedEnvironment;
  /**
   * The namespace kind discovery resolves for the top-level namespace the
   * environment covers, giving its boundary facts.
   */
  readonly namespace: NamespaceKind;
}
