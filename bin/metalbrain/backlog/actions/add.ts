import { backlog } from "#metalbrain/backlog/constants";
import { listMergeHints } from "#metalbrain/kinds/index";
import { addRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext, runInvocations } from "#workflows/cli/index";
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
    },
  ][],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const ids = await runInvocations(invocations, (category, title, options) => {
    return addRecord(
      filesystem,
      backlog,
      category,
      {
        title,
        ...options,
      },
      {
        wordCap: agents.wordCaps[backlog.wordCap],
      },
    );
  });

  await settleChanges(config, { check: false });

  for (const id of ids) {
    reporter.log(id);

    const hints = await listMergeHints(filesystem, backlog, id);

    for (const line of hints) {
      reporter.log(line);
    }
  }
}
