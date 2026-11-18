import { settleChanges } from "#project/sync/index";
import { generateMetadataSchemas } from "#scripts/codegen/operations/generateMetadataSchemas";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  await generateMetadataSchemas(config);

  await settleChanges(config, {
    check,
  });
}
