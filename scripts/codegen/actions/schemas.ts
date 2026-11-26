import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { generateMetadataSchemas } from "#scripts/codegen/operations/generateMetadataSchemas";
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
