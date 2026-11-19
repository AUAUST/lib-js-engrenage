import type { LoadedConfig } from "#project/config/index";

/**
 * @experimental
 */
export interface SyncDone {
  /**
   * The config the targets ran against, its sections forgotten since the last
   * `generate` target ran, and its staged changes formatted as sync writes them.
   */
  readonly config: LoadedConfig;
  /**
   * The names of the targets that ran, in run order, failed checks included.
   */
  readonly targets: readonly string[];
}
