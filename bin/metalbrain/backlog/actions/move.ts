import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordRename, moveRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (given: string, category: string): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const { id } = await moveRecord(
    config.context.filesystem,
    backlog,
    given,
    category,
    { wordCap: agents.wordCaps[backlog.wordCap] },
  );

  const rename = formatRecordRename(given, id);

  if (rename !== undefined) {
    reporter.warn(rename);
  }

  await settleChanges(config, { check: false });
}
