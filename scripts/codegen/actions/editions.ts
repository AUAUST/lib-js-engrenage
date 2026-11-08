import { generateEditions } from "#scripts/codegen/operations/generateEditions";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig();

  await generateEditions(config);

  await settleChanges(config, {
    check,
  });
}
