import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordRename, moveRecord } from "#metalbrain/records/index";
import { getRunContext, runInvocations } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  invocations: readonly [given: string, category: string][],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const renames = await runInvocations(invocations, async (given, category) => {
    const { id } = await moveRecord(
      config.context.filesystem,
      backlog,
      given,
      category,
      { wordCap: agents.wordCaps[backlog.wordCap] },
    );

    return formatRecordRename(given, id);
  });

  for (const rename of renames) {
    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
