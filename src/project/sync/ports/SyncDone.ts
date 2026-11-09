import type { LoadedConfig } from "#project/config/index";

export interface SyncDone {
  readonly config: LoadedConfig;
  readonly targets: readonly string[];
}
