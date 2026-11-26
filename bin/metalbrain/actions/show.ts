import { isString } from "@auaust/toolkit";

import {
  createRecordKindResolver,
  formatRecordDetailTree,
} from "#metalbrain/kinds/index";
import {
  findRecords,
  formatRecordRename,
  listRecordTaps,
  orderRecordEntry,
} from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  ids: readonly string[],
  kindName?: string,
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const located = await findRecords(
    filesystem,
    ids,
    createRecordKindResolver(filesystem, kindName),
    "No entry was printed:",
  );

  for (const { given, found } of located) {
    const rename = formatRecordRename(given, found.id);

    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  const records = located.map(({ kind, found }) => {
    const { created, ...entry } = found.entry;

    return {
      kind,
      group: found.group,
      created: isString(created) ? created : undefined,
      taps: listRecordTaps(found, found.id),
      entry: orderRecordEntry(kind, entry),
    };
  });

  for (const line of formatRecordDetailTree(records)) {
    reporter.log(line);
  }
}
