import { findLogKind } from "#metalbrain/logs/index";
import { closeRecord, formatRecordRename } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string, given: string): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { id } = await closeRecord(config.context.filesystem, kind, given);

  const rename = formatRecordRename(given, id);

  if (rename !== undefined) {
    reporter.warn(rename);
  }

  await settleChanges(config, { check: false });
}
