import { createRecordKindResolver } from "#metalbrain/kinds/index";
import { formatRecordRename, tapRecords } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  ids: readonly string[],
  note: string | undefined,
  kindName: string,
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const tapped = await tapRecords(
    filesystem,
    ids,
    createRecordKindResolver(filesystem, kindName),
    {
      note,
      noteCap: agents.wordCaps.logEntry,
      wordCaps: { ...agents.wordCaps },
    },
  );

  for (const { given, found } of tapped) {
    const rename = formatRecordRename(given, found.id);

    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
