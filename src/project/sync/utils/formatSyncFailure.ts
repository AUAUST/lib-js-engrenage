import type { SyncFailure } from "#project/sync/types/SyncFailure";

export function formatSyncFailure({ target, error }: SyncFailure): string {
  return `failed: ${target}\n${error instanceof Error ? error.message : String(error)}`;
}
