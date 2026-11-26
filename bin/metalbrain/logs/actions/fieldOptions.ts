import { Option, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { findLogKind } from "#metalbrain/logs/index";
import { collectArgument } from "#nexus/cli/index";
import type { RecordFields } from "#metalbrain/records/index";

export default function (command: CommandUnknownOpts): void {
  const kind = findLogKind(command.parent?.name() ?? "");

  const adding = command.name() === "add";

  const fields: RecordFields = kind.fields;

  for (const [key, { type, description, requiredOnAdd }] of Object.entries(
    fields,
  )) {
    const option = new Option(`--${key} <text>`, description);

    if (type === "sites" || type === "detail") {
      option.argParser(collectArgument);
    } else if (adding && (type === "text" || requiredOnAdd === true)) {
      option.makeOptionMandatory();
    }

    command.addOption(option);
  }
}
