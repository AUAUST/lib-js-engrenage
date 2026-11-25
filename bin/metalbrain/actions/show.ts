import { stringify } from "yaml";

import { locateRecord } from "#metalbrain/kinds/index";
import {
  formatRecordRename,
  orderRecordEntry,
} from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (ids: readonly string[]): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  for (const given of ids) {
    const {
      kind,
      found,
    } = await locateRecord(config.context.filesystem, given);

    const rename = formatRecordRename(given, found.id);

    if (rename !== undefined) {
      reporter.warn(rename);
    }

    const entry = orderRecordEntry(kind, found.entry);

    // @debt a grouped kind's group prints as `group`, where `backlog show` names it `category`, since a kind declares no name for its groups

    reporter.log(
      stringify(
        {
          [kind.name]: "directory" in kind.location
            ? { group: found.group, ...entry }
            : entry,
        },
        {
          lineWidth: 0,
        },
      ).trimEnd(),
    );
  }
}
