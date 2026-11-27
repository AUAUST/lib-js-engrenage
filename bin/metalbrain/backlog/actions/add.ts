import { backlog } from "#metalbrain/backlog/constants";
import { listMergeHints } from "#metalbrain/kinds/index";
import { addRecord } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  category: string,
  title: string,
  {
    keywords = [],
    ...values
  }: {
    sites?: string[] | undefined;
    why?: string[] | undefined;
    want?: string[] | undefined;
    done?: string[] | undefined;
    keywords?: string[] | undefined;
  },
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

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

  await settleChanges(config, { check: false });

  reporter.log(id);

  const hints = await listMergeHints(filesystem, backlog, id, { keywords });

  for (const line of hints) {
    reporter.log(line);
  }
}
