import type { SyncResult } from "#types/SyncResult";

export function formatSyncResult({ file, status }: SyncResult): string {
  return `${status}: ${file}`;
}
