import { stringify } from "yaml";

import { findLogKind } from "#metalbrain/logs/index";
import {
  findRecord,
  formatRecordRename,
  orderRecordEntry,
} from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string, given: string): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const {
    id,
    entry,
  } = await findRecord(config.context.filesystem, kind, given);

  const rename = formatRecordRename(given, id);

  if (rename !== undefined) {
    reporter.warn(rename);
  }

  reporter.log(
    stringify(orderRecordEntry(kind, entry), { lineWidth: 0 }).trimEnd(),
  );
}
