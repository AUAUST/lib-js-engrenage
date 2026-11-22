import { backlog } from "#metalbrain/backlog/constants";
import { updateRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  id: string,
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
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const agents = await config.resolve("agents");

  await updateRecord(
    config.context.filesystem,
    backlog,
    id,
    { values, unset },
    { wordCap: agents.wordCaps[backlog.wordCap] },
  );

  await settleChanges(config, { check: false });
}
