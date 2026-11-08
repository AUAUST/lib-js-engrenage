import { generateEditions } from "#scripts/codegen/operations/generateEditions";
import { loadValidatedConfig } from "#workflows/config/index";
import { settleChanges } from "#workflows/sync/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig();

  await generateEditions(config);

  await settleChanges(config, {
    check,
  });
}
