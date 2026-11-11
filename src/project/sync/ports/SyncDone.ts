import type { LoadedConfig } from "#project/config/index";

/** @experimental */
export interface SyncDone {
  readonly config: LoadedConfig;
  readonly targets: readonly string[];
}
