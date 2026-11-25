import { createRecordKindResolver } from "#metalbrain/kinds/index";
import { closeRecords, formatRecordRename } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  ids: readonly string[],
  kindName?: string,
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const closed = await closeRecords(
    filesystem,
    ids,
    createRecordKindResolver(filesystem, kindName),
  );

  for (const { given, found } of closed) {
    const rename = formatRecordRename(given, found.id);

    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
