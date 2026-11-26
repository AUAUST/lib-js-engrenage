import { resolveTscArguments } from "#tools/typescript/index";
import { getRunContext, type ToolRuns } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<ToolRuns> {
  const { reporter } = getRunContext();

  const { runs, skipped } = await resolveTscArguments(
    await loadValidatedConfig(undefined, { reporter }),
    args,
  );

  if (skipped.length > 0) {
    reporter.info(`Not type-checked: ${skipped.join(", ")}`);
  }

  return { runs };
}
