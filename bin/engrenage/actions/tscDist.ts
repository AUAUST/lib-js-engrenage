import { resolveTscDistArguments } from "#tools/typescript/index";
import { getRunContext, type ToolRuns } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<ToolRuns> {
  return {
    runs: await resolveTscDistArguments(
      await loadValidatedConfig(undefined, {
        reporter: getRunContext().reporter,
      }),
      args,
    ),
  };
}
