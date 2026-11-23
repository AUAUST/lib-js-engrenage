import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";
import type { EnvironmentKindEntry } from "#project/environments/ports/EnvironmentKindEntry";

export interface ContributedEnvironmentEntry {
  readonly entry: EnvironmentEntry;
  readonly kind: EnvironmentKindEntry;
}
