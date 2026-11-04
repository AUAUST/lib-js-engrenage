import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

export interface SyncTarget<Flag extends string> {
  sync(
    config: ResolvedConfig,
    flags: Partial<Record<Flag, boolean>>,
  ): void | Promise<void>;
  flags: Partial<Record<Flag, string>>;
}
