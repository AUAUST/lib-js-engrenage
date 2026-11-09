import { settleChanges } from "#project/sync/index";
import { syncBarrels } from "#tools/typescript/index";
import { loadValidatedConfig } from "#workflows/config/index";

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
