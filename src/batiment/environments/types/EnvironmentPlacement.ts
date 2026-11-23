import type { Directory } from "#types/Directory";

export interface EnvironmentPlacement {
  /**
   * Names the registered environment placed on `dir`.
   */
  readonly environment: string;
  readonly dir: Directory;
}
