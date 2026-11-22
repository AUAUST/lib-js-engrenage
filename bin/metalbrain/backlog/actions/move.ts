import { backlog } from "#metalbrain/backlog/constants";
import { moveRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (id: string, category: string): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const agents = await config.resolve("agents");

  await moveRecord(config.context.filesystem, backlog, id, category, {
    wordCap: agents.wordCaps[backlog.wordCap],
  });

  await settleChanges(config, { check: false });
}
