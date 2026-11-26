import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { generateApiDeclarations } from "#scripts/codegen/operations/generateApiDeclarations";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  groups: string[],
  { check }: { check: boolean },
): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  await generateApiDeclarations(config, groups);

  await settleChanges(config, {
    check,
  });
}
