import { formatSyncResult } from "#project/sync/utils/formatSyncResult";
import type { SyncResults } from "#types/SyncResults";

export function reportSyncResults(results: SyncResults) {
  for (const result of results) {
    console.info(formatSyncResult(result));
  }

  if (results.some(({ status }) => status === "outdated")) {
    process.exitCode = 1;
  }
}
