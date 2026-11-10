import { successMessage } from "#constants";
import { collectChanges } from "#project/sync/operations/collectChanges";
import { reportSyncResults } from "#project/sync/operations/reportSyncResults";
import { formatSyncFailure } from "#project/sync/utils/formatSyncFailure";
import type { LoadedConfig } from "#project/config/index";
import type { SyncFailure } from "#project/sync/types/SyncFailure";

export async function settleChanges(
  config: LoadedConfig,
  {
    check,
    failures = [],
  }: { check: boolean; failures?: readonly SyncFailure[] },
) {
  const results = await collectChanges(config, { check });

  reportSyncResults(results);

  for (const failure of failures) {
    console.error(formatSyncFailure(failure));
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  } else if (check && results.length === 0) {
    console.info(successMessage);
  }
}
