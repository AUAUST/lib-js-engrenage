import { stringify } from "yaml";

import { createRecordKindResolver } from "#metalbrain/kinds/index";
import {
  findRecords,
  formatRecordRename,
  orderRecordEntry,
} from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
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

  for (const { given, kind, found } of located) {
    const rename = formatRecordRename(given, found.id);

    if (rename !== undefined) {
      reporter.warn(rename);
    }

    const entry = orderRecordEntry(kind, found.entry);

    // @debt a grouped kind's group prints as `category` under its kind's own command and `group` under `metalbrain show`, since a kind declares no name for its groups
    const printed = kindName === undefined
      ? {
          [kind.name]: "directory" in kind.location
            ? { group: found.group, ...entry }
            : entry,
        }
      : "directory" in kind.location
        ? { category: found.group, ...entry }
        : entry;

    reporter.log(stringify(printed, { lineWidth: 0 }).trimEnd());
  }
}
