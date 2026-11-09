import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";
import type { ResolvedEnvironment } from "#project/environments/ports/ResolvedEnvironment";

export interface ContributedEnvironment {
  readonly entry: EnvironmentEntry;
  readonly environment: ResolvedEnvironment;
}
