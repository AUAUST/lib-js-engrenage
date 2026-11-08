import { generateApiDeclarations } from "#scripts/codegen/operations/generateApiDeclarations";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { settleChanges } from "#workflows/sync/operations/settleChanges";

export default async function (
  groups: string[],
  { check }: { check: boolean },
): Promise<void> {
  const config = await loadValidatedConfig();

  await generateApiDeclarations(config, groups);

  await settleChanges(config, {
    check,
  });
}
