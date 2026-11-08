import type { SyncTarget } from "#workflows/sync/types/SyncTarget";

export function defineSyncTarget<Flag extends string = never>(
  sync: SyncTarget<Flag>["sync"],
): SyncTarget<Flag> {
  return {
    sync,
  };
}
