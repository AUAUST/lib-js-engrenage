import { backlog } from "#metalbrain/backlog/constants";
import { closeRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (id: string): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  await closeRecord(config.context.filesystem, backlog, id);

  await settleChanges(config, { check: false });
}
