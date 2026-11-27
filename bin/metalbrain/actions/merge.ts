import { findNamedRecordKind } from "#metalbrain/kinds/index";
import { formatRecordRename, mergeRecord } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  removed: string,
  kept: string,
  note: string | undefined,
  kindName: string,
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { wordCaps } = await config.resolve("agents");

  const kind = findNamedRecordKind(kindName);

  const merged = await mergeRecord(
    config.context.filesystem,
    kind,
    {
      removed,
      kept,
    },
    {
      note,
      noteCap: wordCaps.logEntry,
      wordCap: wordCaps[kind.wordCap],
    },
  );

  const renames = [
    formatRecordRename(removed, merged.removed),
    formatRecordRename(kept, merged.kept),
  ];

  for (const rename of renames) {
    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
