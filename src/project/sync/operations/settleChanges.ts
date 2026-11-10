import { successMessage } from "#constants";
import { collectChanges } from "#project/sync/operations/collectChanges";
import { reportSyncResults } from "#project/sync/operations/reportSyncResults";
import type { LoadedConfig } from "#project/config/index";

export async function settleChanges(
  config: LoadedConfig,
  { check }: { check: boolean },
) {
  const results = await collectChanges(config, { check });

  reportSyncResults(results);

  if (check && results.length === 0) {
    console.info(successMessage);
  }
}
