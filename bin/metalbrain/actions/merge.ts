import { isNumber } from "@auaust/toolkit";

import { findNamedRecordKind } from "#metalbrain/kinds/index";
import { formatRecordRename, mergeRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  removed: string,
  kept: string,
  note: string | undefined,
  kindName: string,
): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findNamedRecordKind(kindName);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { wordCaps } = await config.resolve("agents");

  const wordCap: unknown = wordCaps[kind.wordCap];

  if (!isNumber(wordCap)) {
    throw new Error(
      `No word cap "${kind.wordCap}" bounds the ${kind.name} records`,
    );
  }

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
      wordCap,
    },
  );

  for (const [given, current] of [
    [removed, merged.removed],
    [kept, merged.kept],
  ] as const) {
    const rename = formatRecordRename(given, current);

    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
