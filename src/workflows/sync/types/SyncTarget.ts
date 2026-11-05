import type { LoadedConfig } from "#project/config/index";

export interface SyncTarget<Flag extends string> {
  sync(
    config: LoadedConfig,
    flags: Partial<Record<Flag, boolean>>,
  ): void | Promise<void>;
  flags: Partial<Record<Flag, string>>;
}
