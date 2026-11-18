import { resolvePrettierAllArguments } from "#tools/prettier/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<readonly string[]> {
  return resolvePrettierAllArguments(
    await loadValidatedConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
    args,
  );
}
