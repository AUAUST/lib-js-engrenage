import type {
  EnvironmentPlacements,
  RegisteredEnvironment,
} from "#batiment/environments/index";

export interface EnvironmentDiscovery {
  readonly registered: readonly RegisteredEnvironment[];
  /**
   * The directory and file placements of the registered environments, the first
   * in registration order kept where two place one directory or file.
   */
  readonly placements: EnvironmentPlacements;
}
