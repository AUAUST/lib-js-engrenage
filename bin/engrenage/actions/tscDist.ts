import { resolveTscDistArguments } from "#tools/typescript/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<readonly string[]> {
  return resolveTscDistArguments(
    await loadValidatedConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
    args,
  );
}
