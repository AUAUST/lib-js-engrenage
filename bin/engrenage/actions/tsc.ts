import { resolveTscArguments } from "#tools/typescript/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  args: string[],
): Promise<readonly string[] | undefined> {
  return resolveTscArguments(
    await loadValidatedConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
    args,
  );
}
