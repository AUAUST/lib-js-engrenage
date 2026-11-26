import { getRunContext } from "#nexus/cli/index";
import { resolveTscDistArguments } from "#tools/typescript/index";
import { loadValidatedConfig } from "#workflows/config/index";
import type { ToolRuns } from "#workflows/cli/index";

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
