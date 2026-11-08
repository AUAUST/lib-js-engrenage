import { syncBarrels } from "#tools/typescript/operations/syncBarrels";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

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
