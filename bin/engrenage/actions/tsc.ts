import { getRunContext } from "#nexus/cli/index";
import {
  describeUncheckedInstances,
  resolveTscArguments,
} from "#tools/typescript/index";
import { loadValidatedConfig } from "#workflows/config/index";
import type { ToolRuns } from "#workflows/cli/index";

export default async function (args: string[]): Promise<ToolRuns> {
  const { reporter } = getRunContext();

  const { runs, skipped } = await resolveTscArguments(
    await loadValidatedConfig(undefined, { reporter }),
    args,
  );

  const notice = describeUncheckedInstances(skipped);

  if (notice) {
    reporter.info(notice);
  }

  return { runs };
}
