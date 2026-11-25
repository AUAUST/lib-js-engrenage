import { stringify } from "yaml";

import { backlog } from "#metalbrain/backlog/constants";
import {
  findRecord,
  formatRecordRename,
  orderRecordEntry,
} from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (given: string): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const {
    id,
    group,
    entry,
  } = await findRecord(config.context.filesystem, backlog, given);

  const rename = formatRecordRename(given, id);

  if (rename !== undefined) {
    reporter.warn(rename);
  }

  reporter.log(
    stringify(
      { category: group, ...orderRecordEntry(backlog, entry) },
      { lineWidth: 0 },
    ).trimEnd(),
  );
}
