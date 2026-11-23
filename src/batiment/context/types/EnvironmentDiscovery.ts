import type {
  EnvironmentPlacement,
  RegisteredEnvironment,
} from "#batiment/environments/index";

export interface EnvironmentDiscovery {
  readonly registered: readonly RegisteredEnvironment[];
  /**
   * The directory placements of the registered environments, in
   * registration order.
   */
  readonly placements: readonly EnvironmentPlacement[];
}
