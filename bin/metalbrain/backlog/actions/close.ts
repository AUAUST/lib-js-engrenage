import { backlog } from "#metalbrain/backlog/constants";
import { closeRecord, formatRecordRename } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (given: string): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { id } = await closeRecord(config.context.filesystem, backlog, given);

  const rename = formatRecordRename(given, id);

  if (rename !== undefined) {
    reporter.warn(rename);
  }

  await settleChanges(config, { check: false });
}
