import { stringify } from "yaml";

import { backlog } from "#metalbrain/backlog/constants";
import { findRecord, orderRecordEntry } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (id: string): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const {
    group,
    entry,
  } = await findRecord(config.context.filesystem, backlog, id);

  reporter.log(
    stringify(
      { category: group, ...orderRecordEntry(backlog, entry) },
      { lineWidth: 0 },
    ).trimEnd(),
  );
}
