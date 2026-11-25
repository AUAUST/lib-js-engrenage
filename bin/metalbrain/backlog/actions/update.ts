import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordRename, updateRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext, runInvocations } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  invocations: readonly [
    given: string,
    options: {
      title?: string | undefined;
      sites?: string[] | undefined;
      why?: string[] | undefined;
      want?: string[] | undefined;
      done?: string[] | undefined;
      unset: string[];
    },
  ][],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const renames = await runInvocations(
    invocations,
    async (given, { unset, ...values }) => {
      const id = await updateRecord(
        config.context.filesystem,
        backlog,
        given,
        { values, unset },
        { wordCap: agents.wordCaps[backlog.wordCap] },
      );

      return formatRecordRename(given, id);
    },
  );

  for (const rename of renames) {
    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
