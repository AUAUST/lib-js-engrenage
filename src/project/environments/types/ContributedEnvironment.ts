import type { ResolvedEnvironment } from "#project/environments/ports/ResolvedEnvironment";
import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export interface ContributedEnvironment extends ContributedEnvironmentEntry {
  readonly environment: ResolvedEnvironment;
}
