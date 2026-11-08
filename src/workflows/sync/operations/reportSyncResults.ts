import type { SyncResults } from "#types/SyncResults";

export function reportSyncResults(results: SyncResults) {
  for (const { file, status } of results) {
    console.info(`${status}: ${file}`);
  }

  if (results.some(({ status }) => status === "outdated")) {
    process.exitCode = 1;
  }
}
