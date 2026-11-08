import { generateEditions } from "#scripts/codegen/operations/generateEditions";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { settleChanges } from "#workflows/sync/operations/settleChanges";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig();

  await generateEditions(config);

  await settleChanges(config, {
    check,
  });
}
