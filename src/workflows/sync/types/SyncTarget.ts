import type { Config } from "#workflows/registry/types/Config";

export interface SyncTarget<Flag extends string> {
  sync(
    config: Config,
    flags: Partial<Record<Flag, boolean>>,
  ): void | Promise<void>;
  flags: Partial<Record<Flag, string>>;
}
