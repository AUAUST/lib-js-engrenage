import { syncBarrels } from "#tools/typescript/operations/syncBarrels";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { settleChanges } from "#workflows/sync/operations/settleChanges";

export default async function (
  barrels: string[],
  { check }: { check: boolean },
): Promise<void> {
  const config = await loadValidatedConfig();

  await syncBarrels(config, barrels);

  await settleChanges(config, {
    check,
  });
}
