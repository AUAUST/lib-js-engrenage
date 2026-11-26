import { backlog } from "#metalbrain/backlog/constants";
import { listMergeHints } from "#metalbrain/kinds/index";
import { addRecord } from "#metalbrain/records/index";
import { getRunContext, runInvocations } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  invocations: readonly [
    category: string,
    title: string,
    options: {
      sites?: string[] | undefined;
      why?: string[] | undefined;
      want?: string[] | undefined;
      done?: string[] | undefined;
      keywords?: string[] | undefined;
    },
  ][],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const added = await runInvocations(
    invocations,
    async (category, title, { keywords = [], ...values }) => {
      const id = await addRecord(
        filesystem,
        backlog,
        category,
        {
          title,
          ...values,
        },
        {
          wordCap: agents.wordCaps[backlog.wordCap],
        },
      );

      return { id, keywords };
    },
  );

  await settleChanges(config, { check: false });

  for (const { id, keywords } of added) {
    reporter.log(id);

    const hints = await listMergeHints(filesystem, backlog, id, { keywords });

    for (const line of hints) {
      reporter.log(line);
    }
  }
}
