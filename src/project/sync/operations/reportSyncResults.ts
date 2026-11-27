import { formatSyncResult } from "#project/sync/utils/formatSyncResult";
import type { Reporter } from "#nexus/reports/index";
import type { SyncResults } from "#types/SyncResults";

export function reportSyncResults(results: SyncResults, reporter: Reporter) {
  for (const result of results) {
    reporter.log(formatSyncResult(result));
  }

  if (results.some(({ status }) => status === "outdated")) {
    process.exitCode = 1;
  }
}
