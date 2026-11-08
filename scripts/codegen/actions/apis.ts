import { generateApiDeclarations } from "#scripts/codegen/operations/generateApiDeclarations";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

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
