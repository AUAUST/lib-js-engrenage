import type { SyncTarget } from "#workflows/sync/types/SyncTarget";

export function defineSyncTarget<Flag extends string = never>(
  sync: SyncTarget<Flag>["sync"],
  flags: Partial<Record<Flag, string>> = {},
): SyncTarget<Flag> {
  return {
    sync,
    flags,
  };
}
