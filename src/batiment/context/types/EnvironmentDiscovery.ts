import type {
  EnvironmentInstance,
  EnvironmentPlacements,
  RegisteredEnvironment,
} from "#batiment/environments/index";

export interface EnvironmentDiscovery {
  readonly registered: readonly RegisteredEnvironment[];
  /**
   * The directory and file placements of the registered environments, the first
   * in registration order kept where two place one directory or file, and an
   * `.environment.json`'s kept over the config's on its directory.
   */
  readonly placements: EnvironmentPlacements;
  /**
   * One instance per registered environment and scope its placements reach.
   */
  readonly instances: readonly EnvironmentInstance[];
}
