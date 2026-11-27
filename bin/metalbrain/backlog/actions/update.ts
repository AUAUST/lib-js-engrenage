import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordRename, updateRecord } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  given: string,
  {
    unset,
    ...values
  }: {
    title?: string | undefined;
    sites?: string[] | undefined;
    why?: string[] | undefined;
    want?: string[] | undefined;
    done?: string[] | undefined;
    unset: string[];
  },
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const id = await updateRecord(
    config.context.filesystem,
    backlog,
    given,
    { values, unset },
    { wordCap: agents.wordCaps[backlog.wordCap] },
  );

  const rename = formatRecordRename(given, id);

  if (rename !== undefined) {
    reporter.warn(rename);
  }

  await settleChanges(config, { check: false });
}
